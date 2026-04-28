import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { TeamSection } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function parseId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toDiskPath(publicPath: string) {
  const relativePath = publicPath.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", relativePath);
}

function parseSection(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  if (value === TeamSection.BoardOfDirectors) return TeamSection.BoardOfDirectors;
  if (value === TeamSection.ResearchTeam) return TeamSection.ResearchTeam;
  return null;
}

function parseBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function saveReplacementPhoto(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only jpeg, png, and webp images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "team");
  await mkdir(uploadDir, { recursive: true });
  const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const destination = path.join(uploadDir, safeFileName);
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return `/uploads/team/${safeFileName}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Invalid team member id." }, { status: 400 });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const updates: Record<string, unknown> = {};

    const name = formData.get("name");
    if (typeof name === "string") updates.name = name.trim();

    const title = formData.get("title");
    if (typeof title === "string") updates.title = title.trim();

    const bio = formData.get("bio");
    if (typeof bio === "string") updates.bio = bio.trim();

    const section = parseSection(formData.get("section"));
    if (section) updates.section = section;

    const isVisible = parseBoolean(formData.get("isVisible"));
    if (typeof isVisible === "boolean") updates.isVisible = isVisible;

    const order = parseOrder(formData.get("order"));
    if (typeof order === "number") updates.order = order;

    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      let newPhotoPath: string;
      try {
        newPhotoPath = await saveReplacementPhoto(photo);
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Invalid image file." },
          { status: 400 },
        );
      }

      updates.photoPath = newPhotoPath;
      if (existing.photoPath.startsWith("/uploads/team/")) {
        try {
          await unlink(toDiskPath(existing.photoPath));
        } catch (error) {
          console.warn("Old team photo could not be removed:", error);
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/team/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update team member." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Invalid team member id." }, { status: 400 });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id } });

    if (existing.photoPath.startsWith("/uploads/team/")) {
      try {
        await unlink(toDiskPath(existing.photoPath));
      } catch (error) {
        console.warn("Team photo could not be removed:", error);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/admin/team/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete team member." },
      { status: 500 },
    );
  }
}
