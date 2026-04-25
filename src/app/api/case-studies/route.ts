import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CaseStudyListItem = {
  id: number;
  title: string;
  description: string;
  pdfPath: string;
  uploadedAt: Date;
};

function toRelativeUploadsPath(pdfPath: string) {
  return pdfPath
    .replace(/^\/?public\/uploads\//, "")
    .replace(/^\/?uploads\//, "")
    .replace(/^\/+/, "");
}

export async function GET() {
  try {
    const caseStudies: CaseStudyListItem[] = await prisma.caseStudy.findMany({
      orderBy: {
        uploadedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        pdfPath: true,
        uploadedAt: true,
      },
    });

    const normalizedCaseStudies = caseStudies.map((caseStudy: CaseStudyListItem) => ({
      ...caseStudy,
      pdfPath: toRelativeUploadsPath(caseStudy.pdfPath),
    }));

    return NextResponse.json(normalizedCaseStudies);
  } catch (error) {
    console.error("GET /api/case-studies failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch case studies" },
      { status: 500 },
    );
  }
}