import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Minimal health check to confirm Prisma client can be imported and queried.
  const studyCount = await prisma.study.count();
  return NextResponse.json({
    ok: true,
    counts: {
      studies: studyCount,
    },
  });
}
