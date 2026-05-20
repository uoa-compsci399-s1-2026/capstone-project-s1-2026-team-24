import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const ALLOWED_STUDY_KEYS = new Set([
  "slug",
  "title",
  "shortDescription",
  "fullDescriptionEn",
  "fullDescriptionZh",
  "eligibilityEn",
  "eligibilityZh",
  "compensationEn",
  "compensationZh",
  "redcapUrl",
  "contactEmail",
  "contactPhone",
  "contactPhoneZh",
  "imagePath",
  "ethicsStatement",
  "isActive",
  "status",
  "category",
  "publishedAt",
  "order",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);
    if (!id) {
      return NextResponse.json({ error: "Invalid study id." }, { status: 400 });
    }
    const study = await prisma.study.findUnique({ where: { id } });
    if (!study) {
      return NextResponse.json({ error: "Study not found." }, { status: 404 });
    }
    return NextResponse.json(study);
  } catch (error) {
    console.error("GET /api/admin/studies/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch study." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);
    if (!id) {
      return NextResponse.json({ error: "Invalid study id." }, { status: 400 });
    }

    const existing = await prisma.study.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Study not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_STUDY_KEYS.has(key)) continue;
      if (key === "publishedAt") {
        if (value === null || value === "") {
          updates[key] = null;
        } else if (typeof value === "string") {
          const parsed = new Date(value);
          updates[key] = Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        continue;
      }
      if (typeof value === "string") {
        updates[key] = value.trim();
      } else {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      );
    }

    const updated = await prisma.study.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/studies/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update study." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);
    if (!id) {
      return NextResponse.json({ error: "Invalid study id." }, { status: 400 });
    }

    const existing = await prisma.study.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Study not found." }, { status: 404 });
    }

    await prisma.study.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/admin/studies/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete study." },
      { status: 500 },
    );
  }
}
