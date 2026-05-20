import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const publications = await prisma.publication.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ year: "desc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        authors: {
          orderBy: { order: "asc" },
          include: {
            teamMember: {
              select: {
                id: true,
                name: true,
                title: true,
                section: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(publications, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/publications failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications." },
      { status: 500 },
    );
  }
}
