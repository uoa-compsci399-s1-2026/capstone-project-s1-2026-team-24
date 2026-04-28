import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const study = await prisma.study.findFirst({
      where: {
        slug,
      },
      select: {
        title: true,
        fullDescriptionEn: true,
        fullDescriptionZh: true,
        eligibilityEn: true,
        eligibilityZh: true,
        compensationEn: true,
        compensationZh: true,
        redcapUrl: true,
        contactEmail: true,
        contactPhone: true,
        ethicsStatement: true,
      },
    });

    if (!study) {
      return NextResponse.json({ error: "Study not found." }, { status: 404 });
    }

    return NextResponse.json(study, { status: 200 });
  } catch (error) {
    console.error("GET /api/studies/[slug] failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch study details." },
      { status: 500 },
    );
  }
}
