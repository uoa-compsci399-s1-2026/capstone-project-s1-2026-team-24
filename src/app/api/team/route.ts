import { NextResponse } from "next/server";
import { TeamSection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const memberSelect = {
      id: true,
      name: true,
      title: true,
      section: true,
      bio: true,
      photoPath: true,
      profileUrl: true,
    } as const;

    const [boardOfDirectors, researchTeam, alumni] = await Promise.all([
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          section: TeamSection.BoardOfDirectors,
        },
        orderBy: {
          order: "asc",
        },
        select: memberSelect,
      }),
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          section: TeamSection.ResearchTeam,
        },
        orderBy: {
          order: "asc",
        },
        select: memberSelect,
      }),
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          section: TeamSection.Alumni,
        },
        orderBy: {
          order: "asc",
        },
        select: memberSelect,
      }),
    ]);

    return NextResponse.json({
      boardOfDirectors,
      researchTeam,
      alumni,
    });
  } catch (error) {
    console.error("GET /api/team failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 },
    );
  }
}


