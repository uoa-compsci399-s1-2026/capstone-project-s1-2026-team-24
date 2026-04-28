import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        contactEmail: true,
        isActive: true,
      },
    });

    return NextResponse.json(studies, { status: 200 });
  } catch (error) {
    console.error("GET /api/studies failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies." },
      { status: 500 },
    );
  }
}
