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

const MIN_FORM_FILL_MS = 3000;
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_URLS_IN_MESSAGE = 3;
const URL_REGEX = /https?:\/\/|www\./gi;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function countUrlsLike(text: string) {
  const matches = text.match(URL_REGEX);
  return matches ? matches.length : 0;
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
    const elapsedMs =
      typeof body?.elapsedMs === "number" && Number.isFinite(body.elapsedMs)
        ? body.elapsedMs
        : 0;

    // Bot honeypot: silently accept (don't leak that we filter it).
    if (honeypot) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Bot time-trap: a real user takes >3s to fill the form.
    if (elapsedMs < MIN_FORM_FILL_MS) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const ip = getClientIp(request);
    const ipRateLimit = checkRateLimit(`ip:${ip}`);

    if (!ipRateLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );

      if (ipRateLimit.retryAfterSeconds) {
        response.headers.set(
          "Retry-After",
          String(ipRateLimit.retryAfterSeconds),
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

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `name must be ${MAX_NAME_LENGTH} characters or fewer.` },
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

    if (message.length < MIN_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `message must be at least ${MIN_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    if (countUrlsLike(message) > MAX_URLS_IN_MESSAGE) {
      return NextResponse.json(
        { error: "Please remove some links from your message." },
        { status: 400 },
      );
    }

    const emailRateLimit = checkRateLimit(`email:${email.toLowerCase()}`);
    if (!emailRateLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );
      if (emailRateLimit.retryAfterSeconds) {
        response.headers.set(
          "Retry-After",
          String(emailRateLimit.retryAfterSeconds),
        );
      }
      return response;
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

