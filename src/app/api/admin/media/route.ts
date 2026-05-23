import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MEDIA_UPLOAD_PREFIX = "uploads/media";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Raster formats only — SVG is excluded to avoid stored-XSS via uploaded markup.
function isAllowedImage(file: File) {
  return (
    /^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)
  );
}

async function tryRemoveFile(filePath: string) {
  const relative = filePath.replace(/^\/+/, "");
  if (!relative.startsWith(MEDIA_UPLOAD_PREFIX)) return;
  try {
    await unlink(path.join(process.cwd(), "public", relative));
  } catch (error) {
    console.warn("Media file could not be removed:", error);
  }
}

export async function GET() {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let savedPath = "";
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const altText = formData.get("altText");
    const caption = formData.get("caption");

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
    const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    await writeFile(
      path.join(uploadDir, safeFileName),
      Buffer.from(await file.arrayBuffer()),
    );
    savedPath = `/${MEDIA_UPLOAD_PREFIX}/${safeFileName}`;

    const asset = await prisma.mediaAsset.create({
      data: {
        filePath: savedPath,
        originalName: file.name,
        altText: typeof altText === "string" ? altText : "",
        caption: typeof caption === "string" ? caption : "",
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (savedPath) await tryRemoveFile(savedPath);
    console.error("Failed to upload media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 },
    );
  }
}
