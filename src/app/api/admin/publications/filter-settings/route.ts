import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MIN_YEAR,
  DEFAULT_ROUTES,
  parseLines,
  parseRoute,
  type RouteTarget,
} from "@/lib/publication-filter";
import { getOrCreateFilterSetting } from "@/lib/publication-filter-settings";

// Body key -> the route column it updates and its default. Each value must be
// one of "Approved" | "Pending" | "Rejected"; anything else is a 400.
const ROUTE_FIELDS = [
  ["routeUnitAffiliation", DEFAULT_ROUTES.unitAffiliation],
  ["routeInstitutionKeyword", DEFAULT_ROUTES.institutionKeyword],
  ["routeStrongKeywords", DEFAULT_ROUTES.strongKeywords],
  ["routeWeakMatch", DEFAULT_ROUTES.weakMatch],
  ["routeExclusion", DEFAULT_ROUTES.exclusion],
] as const satisfies ReadonlyArray<readonly [string, RouteTarget]>;

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

// Coerce/normalise a list field to newline-separated text. Accepts an array of
// strings or a raw string, and splits on BOTH newlines and commas via the shared
// `parseLines` — matching the read path so a comma-pasted value round-trips
// consistently (what's stored == what's displayed == what the classifier parses).
function normalizeListField(value: unknown): string {
  const items = Array.isArray(value)
    ? value.flatMap((item) =>
        typeof item === "string" ? parseLines(item) : [],
      )
    : typeof value === "string"
      ? parseLines(value)
      : [];
  return items.join("\n");
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
      routeUnitAffiliation: string;
      routeInstitutionKeyword: string;
      routeStrongKeywords: string;
      routeWeakMatch: string;
      routeExclusion: string;
    } = {
      minYear: current.minYear,
      affiliationPhrases: current.affiliationPhrases,
      institutionRors: current.institutionRors,
      strongKeywords: current.strongKeywords,
      weakKeywords: current.weakKeywords,
      exclusionKeywords: current.exclusionKeywords,
      routeUnitAffiliation: current.routeUnitAffiliation,
      routeInstitutionKeyword: current.routeInstitutionKeyword,
      routeStrongKeywords: current.routeStrongKeywords,
      routeWeakMatch: current.routeWeakMatch,
      routeExclusion: current.routeExclusion,
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

    // Routing rules: each provided value must be a valid bucket, else 400 so the
    // admin gets clear feedback rather than a silent fallback.
    for (const [key, fallback] of ROUTE_FIELDS) {
      if (!(key in body)) continue;
      const value = (body as Record<string, unknown>)[key];
      if (parseRoute(value, fallback) !== value) {
        return NextResponse.json(
          {
            error: `${key} must be one of "Approved", "Pending", or "Rejected".`,
          },
          { status: 400 },
        );
      }
      data[key] = value as RouteTarget;
    }

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
