import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MIN_YEAR } from "@/lib/publication-filter";
import { getOrCreateFilterSetting } from "@/lib/publication-filter-settings";

// Reads/writes the singleton PublicationFilterSetting that drives the ORCID
// relevance filter. The settings UI is embedded in /admin/publications.

export async function GET() {
  try {
    const setting = await getOrCreateFilterSetting();
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/publications/filter-settings failed:", error);
    return NextResponse.json(
      { error: "Failed to load filter settings." },
      { status: 500 },
    );
  }
}

// Coerce/normalise a list field: accept either an array of strings or a raw
// multiline string, and persist as newline-separated text.
function normalizeListField(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const current = await getOrCreateFilterSetting();

    const data: {
      minYear: number;
      affiliationPhrases: string;
      institutionRors: string;
      strongKeywords: string;
      weakKeywords: string;
      exclusionKeywords: string;
    } = {
      minYear: current.minYear,
      affiliationPhrases: current.affiliationPhrases,
      institutionRors: current.institutionRors,
      strongKeywords: current.strongKeywords,
      weakKeywords: current.weakKeywords,
      exclusionKeywords: current.exclusionKeywords,
    };

    if ("minYear" in body) {
      const year = Number(body.minYear);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        return NextResponse.json(
          { error: "minYear must be a year between 1900 and 2100." },
          { status: 400 },
        );
      }
      data.minYear = year;
    } else if (!Number.isInteger(data.minYear)) {
      data.minYear = DEFAULT_MIN_YEAR;
    }

    if ("affiliationPhrases" in body)
      data.affiliationPhrases = normalizeListField(body.affiliationPhrases);
    if ("institutionRors" in body)
      data.institutionRors = normalizeListField(body.institutionRors);
    if ("strongKeywords" in body)
      data.strongKeywords = normalizeListField(body.strongKeywords);
    if ("weakKeywords" in body)
      data.weakKeywords = normalizeListField(body.weakKeywords);
    if ("exclusionKeywords" in body)
      data.exclusionKeywords = normalizeListField(body.exclusionKeywords);

    const updated = await prisma.publicationFilterSetting.update({
      where: { id: current.id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/publications/filter-settings failed:", error);
    return NextResponse.json(
      { error: "Failed to update filter settings." },
      { status: 500 },
    );
  }
}
