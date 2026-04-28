import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partnerLogos = await prisma.partnerLogo.findMany({
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        logoPath: true,
        websiteUrl: true,
        isPlaceholder: true,
      },
    });

    return NextResponse.json(partnerLogos, { status: 200 });
  } catch (error) {
    console.error("GET /api/partner-logos failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner logos." },
      { status: 500 },
    );
  }
}
