import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.mailingListEntry.findMany({
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch mailing list entries:", error);

    return NextResponse.json(
      { error: "Failed to fetch mailing list entries" },
      { status: 500 }
    );
  }
}
