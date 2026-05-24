import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getImageDimensions } from "@/lib/image-dimensions";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MEDIA_UPLOAD_PREFIX = "uploads/media";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedImage(file: File) {
  return (
    /^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)
  );
}

// POST: replace an asset's file while keeping the same record (and id), so every
// reference to it keeps working. Managed uploads are overwritten in place (the
// path is preserved, so even legacy raw-path references stay valid); cataloged
// /public assets are not overwritten — a fresh managed file is written and the
// record repointed at it (id references stay valid).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name || file.size === 0) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }
    if (!isAllowedImage(file)) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, WebP, GIF or AVIF images are allowed" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 10MB or less" },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", MEDIA_UPLOAD_PREFIX);
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());

    const isManaged = existing.filePath
      .replace(/^\/+/, "")
      .startsWith(MEDIA_UPLOAD_PREFIX);
    let targetPath: string;
    if (isManaged) {
      targetPath = existing.filePath; // overwrite in place
    } else {
      targetPath = `/${MEDIA_UPLOAD_PREFIX}/${Date.now()}-${sanitizeFileName(file.name)}`;
    }
    await writeFile(
      path.join(process.cwd(), "public", targetPath.replace(/^\/+/, "")),
      buffer,
    );

    const dimensions = getImageDimensions(buffer);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        filePath: targetPath,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to replace media:", error);
    return NextResponse.json(
      { error: "Failed to replace media" },
      { status: 500 },
    );
  }
}
