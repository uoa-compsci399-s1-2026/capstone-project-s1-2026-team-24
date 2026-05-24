import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, rename, unlink } from "fs/promises";
import path from "path";
import { getImageDimensions } from "@/lib/image-dimensions";
import {
  MAX_FILE_SIZE,
  MEDIA_UPLOAD_PREFIX,
  sanitizeFileName,
  isAllowedImage,
} from "@/lib/media-upload";

export const runtime = "nodejs";

// POST: replace an asset's file while keeping the same record (and id), so every
// reference to it keeps working. Managed uploads are overwritten in place (path
// preserved, so even legacy raw-path references stay valid); cataloged /public
// assets are not overwritten — a fresh managed file is written and the record
// repointed (id references stay valid).
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
    const targetPath = isManaged
      ? existing.filePath
      : `/${MEDIA_UPLOAD_PREFIX}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const targetFsPath = path.join(
      process.cwd(),
      "public",
      targetPath.replace(/^\/+/, ""),
    );

    // Write to a temp file first, commit the DB, then atomically move it into
    // place. A failed DB update therefore never corrupts the existing file
    // (managed overwrite) nor leaves an orphan (cataloged repoint).
    const tmpFsPath = path.join(
      uploadDir,
      `.tmp-${Date.now()}-${sanitizeFileName(file.name)}`,
    );
    await writeFile(tmpFsPath, buffer);

    const dimensions = getImageDimensions(buffer);
    try {
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
      await rename(tmpFsPath, targetFsPath);
      return NextResponse.json(updated);
    } catch (err) {
      await unlink(tmpFsPath).catch(() => {});
      throw err;
    }
  } catch (error) {
    console.error("Failed to replace media:", error);
    return NextResponse.json(
      { error: "Failed to replace media" },
      { status: 500 },
    );
  }
}
