import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseStudyId = Number(id);

    if (Number.isNaN(caseStudyId)) {
      return NextResponse.json(
        { error: "Invalid case study ID" },
        { status: 400 }
      );
    }

    const caseStudy = await prisma.caseStudy.findUnique({
      where: {
        id: caseStudyId,
      },
    });

    if (!caseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    await prisma.caseStudy.delete({
      where: {
        id: caseStudyId,
      },
    });

    const relativePdfPath = caseStudy.pdfPath.replace(/^\/+/, "");
    const diskPath = path.join(process.cwd(), "public", relativePdfPath);

    try {
      await unlink(diskPath);
    } catch (fileError) {
      console.warn("PDF file could not be removed:", fileError);
    }

    return NextResponse.json({
      message: "Case study deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete case study:", error);

    return NextResponse.json(
      { error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}