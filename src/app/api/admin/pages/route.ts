import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// List all editable pages with their block counts.
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        // "studies" is being reworked directly on the public site — hide it
        // from the page editor so content editors don't change it here.
        slug: { not: "studies" },
        NOT: { slug: { startsWith: "studylayout-" } },
      },
      orderBy: { slug: "asc" },
      include: { _count: { select: { blocks: true } } },
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}
