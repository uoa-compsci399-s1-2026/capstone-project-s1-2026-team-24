import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const recipients = await prisma.contactRecipient.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(recipients);
  } catch (error) {
    console.error("GET /api/admin/contact-recipients failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact recipients." },
      { status: 500 },
    );
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body !== "object" ||
      typeof body.category !== "string" ||
      typeof body.email !== "string"
    ) {
      return NextResponse.json(
        { error: "category and email are required strings." },
        { status: 400 },
      );
    }

    const email = body.email.trim();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "email must be a valid email address." },
        { status: 400 },
      );
    }

    const existing = await prisma.contactRecipient.findUnique({
      where: { category: body.category },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "No recipient exists for that category." },
        { status: 404 },
      );
    }

    const updated = await prisma.contactRecipient.update({
      where: { category: body.category },
      data: { email },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/contact-recipients failed:", error);
    return NextResponse.json(
      { error: "Failed to update contact recipient." },
      { status: 500 },
    );
  }
}
