import { mkdir, writeFile } from "node:fs/promises";
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

function parseBoolean(value: FormDataEntryValue | null, fallback = true) {
  if (typeof value !== "string") return fallback;
  return value === "true";
}

function parseOrder(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSection(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  if (value === TeamSection.BoardOfDirectors) return TeamSection.BoardOfDirectors;
  if (value === TeamSection.ResearchTeam) return TeamSection.ResearchTeam;
  return null;
}

async function saveTeamPhoto(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only jpeg, png, and webp images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "team");
  await mkdir(uploadDir, { recursive: true });

  const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const filePath = path.join(uploadDir, safeFileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/team/${safeFileName}`;
}

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/team failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const title = formData.get("title");
    const section = parseSection(formData.get("section"));
    const bio = formData.get("bio");
    const photo = formData.get("photo");

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }
    if (!section) {
      return NextResponse.json({ error: "section is invalid." }, { status: 400 });
    }
    if (typeof bio !== "string" || !bio.trim()) {
      return NextResponse.json({ error: "bio is required." }, { status: 400 });
    }
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "photo file is required." }, { status: 400 });
    }

    let photoPath: string;
    try {
      photoPath = await saveTeamPhoto(photo);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid image file." },
        { status: 400 },
      );
    }

    const created = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        section,
        bio: bio.trim(),
        photoPath,
        order: parseOrder(formData.get("order"), 0),
        isVisible: parseBoolean(formData.get("isVisible"), true),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/team failed:", error);
    return NextResponse.json(
      { error: "Failed to create team member." },
      { status: 500 },
    );
  }
}
