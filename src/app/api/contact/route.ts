import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_CATEGORIES = [
  "Study Participant Enquiry",
  "Industry Partnership",
  "Internship or PhD Opportunity",
  "Donation",
  "General Enquiry",
  "Other",
] as const;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const name = asTrimmedString(body?.name);
    const email = asTrimmedString(body?.email);
    const category = asTrimmedString(body?.category);
    const message = asTrimmedString(body?.message);
    const honeypot = asTrimmedString(body?.honeypot);

    if (honeypot) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );

      if (rateLimit.retryAfterSeconds) {
        response.headers.set(
          "Retry-After",
          String(rateLimit.retryAfterSeconds),
        );
      }

      return response;
    }

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: "name, email, category, and message are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "email must be a valid email address." },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_CATEGORIES.includes(
        category as (typeof ALLOWED_CATEGORIES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "category must be one of the allowed values." },
        { status: 400 },
      );
    }

    const recipient = await prisma.contactRecipient.findUnique({
      where: { category },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "No recipient configured for this inquiry type." },
        { status: 500 },
      );
    }

    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        category,
        message,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact failed:", error);
    return NextResponse.json(
      { error: "Failed to process contact submission." },
      { status: 500 },
    );
  }
}


