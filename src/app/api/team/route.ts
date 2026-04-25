import { NextResponse } from "next/server";
import { TeamSection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [boardOfDirectors, researchTeam] = await Promise.all([
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          section: TeamSection.BoardOfDirectors,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          name: true,
          title: true,
          section: true,
          bio: true,
          photoPath: true,
        },
      }),
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          section: TeamSection.ResearchTeam,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          name: true,
          title: true,
          section: true,
          bio: true,
          photoPath: true,
        },
      }),
    ]);

    return NextResponse.json({
      boardOfDirectors,
      researchTeam,
    });
  } catch (error) {
    console.error("GET /api/team failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 },
    );
  }
}


