import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_CATEGORIES = [
  "Study Participant Inquiry",
  "Industry Partnership",
  "Media & Press",
  "General Enquiry",
  "Other",
] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const category =
      typeof body?.category === "string" ? body.category.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

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

    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        category,
        message,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact failed:", error);
    return NextResponse.json(
      { error: "Failed to process contact submission." },
      { status: 500 },
    );
  }
}
