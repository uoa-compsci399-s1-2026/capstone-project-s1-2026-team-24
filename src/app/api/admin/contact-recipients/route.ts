import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admin CRUD for inquiry types (ContactRecipient rows double as the type list
// and the per-type notification recipient). `category` is the immutable
// canonical key stored on submissions — renames only touch the labels.

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const recipients = await prisma.contactRecipient.findMany({
      orderBy: [{ isArchived: "asc" }, { order: "asc" }, { id: "asc" }],
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

/** Create a new inquiry type. The English label becomes the canonical category. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const labelEn = asTrimmedString(body?.labelEn).replace(/\s+/g, " ");
    const labelZh = asTrimmedString(body?.labelZh);
    const email = asTrimmedString(body?.email);

    if (!labelEn) {
      return NextResponse.json(
        { error: "An English label is required." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "email must be a valid email address." },
        { status: 400 },
      );
    }

    const category = labelEn;
    const existing = await prisma.contactRecipient.findUnique({
      where: { category },
    });
    if (existing && !existing.isArchived) {
      return NextResponse.json(
        { error: "An inquiry type with that name already exists." },
        { status: 409 },
      );
    }

    const maxOrder = await prisma.contactRecipient.aggregate({
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    // Re-adding a previously archived type restores the same canonical
    // category, so its historical submissions reattach to the revived type.
    const saved = existing
      ? await prisma.contactRecipient.update({
          where: { category },
          data: { labelEn, labelZh, email, order, isArchived: false },
        })
      : await prisma.contactRecipient.create({
          data: { category, labelEn, labelZh, email, order },
        });

    return NextResponse.json(saved, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/admin/contact-recipients failed:", error);
    return NextResponse.json(
      { error: "Failed to create contact recipient." },
      { status: 500 },
    );
  }
}

/** Update labels/email/order/archived for one type (category is immutable). */
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || typeof body.category !== "string") {
      return NextResponse.json(
        { error: "category is required." },
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

    const data: {
      email?: string;
      labelEn?: string;
      labelZh?: string;
      order?: number;
      isArchived?: boolean;
    } = {};

    if (body.email !== undefined) {
      const email = asTrimmedString(body.email);
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: "email must be a valid email address." },
          { status: 400 },
        );
      }
      data.email = email;
    }
    if (body.labelEn !== undefined) {
      const labelEn = asTrimmedString(body.labelEn);
      if (!labelEn) {
        return NextResponse.json(
          { error: "The English label cannot be empty." },
          { status: 400 },
        );
      }
      data.labelEn = labelEn;
    }
    if (body.labelZh !== undefined) {
      data.labelZh = asTrimmedString(body.labelZh);
    }
    if (body.order !== undefined) {
      if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
        return NextResponse.json(
          { error: "order must be an integer." },
          { status: 400 },
        );
      }
      data.order = body.order;
    }
    if (body.isArchived !== undefined) {
      if (typeof body.isArchived !== "boolean") {
        return NextResponse.json(
          { error: "isArchived must be a boolean." },
          { status: 400 },
        );
      }
      // Refuse to archive the last active type — the public form needs at
      // least one option to function.
      if (body.isArchived && !existing.isArchived) {
        const activeCount = await prisma.contactRecipient.count({
          where: { isArchived: false },
        });
        if (activeCount <= 1) {
          return NextResponse.json(
            { error: "At least one active inquiry type is required." },
            { status: 400 },
          );
        }
      }
      data.isArchived = body.isArchived;
    }

    const updated = await prisma.contactRecipient.update({
      where: { category: body.category },
      data,
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

/** Hard-delete a type — only when no submissions reference it (else archive). */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const category = asTrimmedString(body?.category);
    if (!category) {
      return NextResponse.json(
        { error: "category is required." },
        { status: 400 },
      );
    }

    const existing = await prisma.contactRecipient.findUnique({
      where: { category },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "No recipient exists for that category." },
        { status: 404 },
      );
    }

    const submissionCount = await prisma.contactSubmission.count({
      where: { category },
    });
    if (submissionCount > 0) {
      return NextResponse.json(
        {
          error: `This type has ${submissionCount} submission(s) — archive it instead so they stay readable.`,
        },
        { status: 409 },
      );
    }

    if (!existing.isArchived) {
      const activeCount = await prisma.contactRecipient.count({
        where: { isArchived: false },
      });
      if (activeCount <= 1) {
        return NextResponse.json(
          { error: "At least one active inquiry type is required." },
          { status: 400 },
        );
      }
    }

    await prisma.contactRecipient.delete({ where: { category } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/contact-recipients failed:", error);
    return NextResponse.json(
      { error: "Failed to delete contact recipient." },
      { status: 500 },
    );
  }
}
