import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/data/team";

export async function GET() {
  try {
    const teamData = await getTeamData();
    return NextResponse.json(teamData);
  } catch (error) {
    console.error("GET /api/team failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 },
    );
  }
}
