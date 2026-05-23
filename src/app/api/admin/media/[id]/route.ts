import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MEDIA_UPLOAD_PREFIX = "uploads/media";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
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

// Update an asset's alt text / caption.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const data: { altText?: string; caption?: string } = {};
    if (typeof body.altText === "string") data.altText = body.altText;
    if (typeof body.caption === "string") data.caption = body.caption;

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(existing);
    }

    const updated = await prisma.mediaAsset.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 },
    );
  }
}

// Delete an asset record and its underlying file.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    await prisma.mediaAsset.delete({ where: { id } });
    await tryRemoveFile(existing.filePath);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}
