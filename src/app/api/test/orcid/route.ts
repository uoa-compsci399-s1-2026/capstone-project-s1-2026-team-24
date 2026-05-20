import { NextResponse } from "next/server";
import { fetchNormalizedOrcidWorks } from "@/lib/orcid";

export async function GET() {
  try {
    const works = await fetchNormalizedOrcidWorks("0009-0001-4238-188X");
    return NextResponse.json(works, { status: 200 });
  } catch (error) {
    console.error("GET /api/test/orcid failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch ORCID works." },
      { status: 500 },
    );
  }
}