import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function parseId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const studyId = parseId(idParam);
    if (!studyId) {
      return NextResponse.json({ error: "Invalid study id." }, { status: 400 });
    }

    const pdfs = await prisma.studyPdf.findMany({
      where: { studyId },
      orderBy: [{ order: "asc" }, { uploadedAt: "asc" }],
    });

    return NextResponse.json(pdfs);
  } catch (error) {
    console.error("GET /api/admin/studies/[id]/pdfs failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch study PDFs." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const studyId = parseId(idParam);
    if (!studyId) {
      return NextResponse.json({ error: "Invalid study id." }, { status: 400 });
    }

    const study = await prisma.study.findUnique({ where: { id: studyId } });
    if (!study) {
      return NextResponse.json({ error: "Study not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const file = formData.get("file");
    const orderRaw = formData.get("order");

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required." },
        { status: 400 },
      );
    }

    const isPdfMime = file.type === "application/pdf";
    const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime || !isPdfExtension) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "File size must be 20MB or less." },
        { status: 400 },
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "studies",
      String(studyId),
    );

    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const diskPath = path.join(uploadDir, safeFileName);

    const bytes = await file.arrayBuffer();
    await writeFile(diskPath, Buffer.from(bytes));

    const order =
      typeof orderRaw === "string" && orderRaw.trim() !== ""
        ? Number(orderRaw)
        : 0;

    const created = await prisma.studyPdf.create({
      data: {
        studyId,
        title: title.trim(),
        pdfPath: `/uploads/studies/${studyId}/${safeFileName}`,
        order: Number.isFinite(order) ? order : 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/studies/[id]/pdfs failed:", error);
    return NextResponse.json(
      { error: "Failed to upload study PDF." },
      { status: 500 },
    );
  }
}
