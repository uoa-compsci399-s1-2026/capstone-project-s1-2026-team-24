import { NextResponse } from "next/server";
import { getPartnerLogos } from "@/lib/data/partner-logos";

export async function GET() {
  try {
    const partnerLogos = await getPartnerLogos();
    return NextResponse.json(partnerLogos, { status: 200 });
  } catch (error) {
    console.error("GET /api/partner-logos failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner logos." },
      { status: 500 },
    );
  }
}
