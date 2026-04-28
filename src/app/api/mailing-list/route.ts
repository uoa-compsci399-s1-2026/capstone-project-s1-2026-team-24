import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "email is required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "email must be a valid email address." },
        { status: 400 },
      );
    }

    const existing = await prisma.mailingListEntry.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return NextResponse.json({ alreadySubscribed: true }, { status: 200 });
    }

    await prisma.mailingListEntry.create({
      data: {
        email,
      },
    });

    return NextResponse.json({ alreadySubscribed: false }, { status: 201 });
  } catch (error) {
    console.error("POST /api/mailing-list failed:", error);
    return NextResponse.json(
      { error: "Failed to process mailing list request." },
      { status: 500 },
    );
  }
}
