import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      where: {
        status: "Approved",
        isVisible: true,
        hiddenManually: false,
      },
      orderBy: [
        { year: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        category: true,
        authors: {
          orderBy: {
            order: "asc",
          },
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
    console.error("GET /api/publications failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications." },
      { status: 500 },
    );
  }
}