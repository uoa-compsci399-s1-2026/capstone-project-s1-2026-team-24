import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSafeHttpUrl } from "@/lib/safe-url";
import { parsePublishedSnapshot } from "@/lib/page-publish";
import { publicPath } from "@/lib/blocks/page-paths";

// This handler reads the database on every request, so it must never be
// prerendered or cached — the result depends entirely on the `q` query param.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type SearchResult = {
  type: "study" | "team" | "page" | "publication" | "page-content";
  title: string;
  snippet: string;
  href: string;
};

const PAGES: { title: string; snippet: string; href: string; keywords: string[] }[] = [
  { title: "Home", snippet: "Welcome to the Human Nutrition Unit", href: "/", keywords: ["home", "hnu"] },
  { title: "About / Discover HNU", snippet: "Who we are and what we do", href: "/about", keywords: ["about", "discover", "facility", "facilities"] },
  { title: "Our Team", snippet: "Board of directors, research team, and alumni", href: "/team", keywords: ["team", "people", "board", "directors", "research", "alumni"] },
  { title: "Our Research", snippet: "Research focus areas and trials", href: "/research", keywords: ["research", "trials", "publications"] },
  { title: "Studies", snippet: "Current studies you can join", href: "/studies", keywords: ["studies", "join", "participant"] },
  { title: "Collaborations", snippet: "Partner with HNU", href: "/collaborations", keywords: ["collaborations", "partners", "industry"] },
  { title: "Donations", snippet: "Support our research", href: "/contact", keywords: ["donations", "donate", "funding"] },
  { title: "Contact", snippet: "Get in touch with our team", href: "/contact", keywords: ["contact", "email", "phone", "address"] },
];

function matchesPage(query: string, page: (typeof PAGES)[number]) {
  const haystack = [page.title, page.snippet, ...page.keywords].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

// How many of each dynamic source we pull from the DB. The final response is
// also capped (RESULT_LIMIT) so the union never overwhelms the dropdown.
const STUDY_TAKE = 8;
const TEAM_TAKE = 8;
const PUBLICATION_TAKE = 8;
const PAGE_CONTENT_TAKE = 6;
const RESULT_LIMIT = 20;

// Roughly how much text we keep on either side of a page-content match so the
// snippet reads as a sentence fragment rather than the whole block.
const SNIPPET_RADIUS = 60;
const SNIPPET_MAX = 160;

/**
 * Collapses a block's parsed content (an arbitrary JSON value: strings, arrays,
 * nested row children, etc.) into one whitespace-normalised, HTML-stripped
 * string of its human-readable copy. Keys/numbers/booleans are ignored — only
 * string *values* carry editable text. URLs and image paths are skipped so a
 * query never matches a `/images/...` path or `https://...` link.
 */
function collectText(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Skip obvious non-prose: bare paths, URLs, and CSS gradient/colour values.
    if (/^(https?:|\/|#|data:|linear-gradient|rgb|var\()/i.test(trimmed)) return;
    out.push(trimmed);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectText(v, out);
    }
  }
}

/** Strips HTML tags and decodes a few common entities from richText copy. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns the full searchable text of a page's published blocks, or "" when the
 * page has never been published / has no usable content. Newlines in copy
 * (stored as "\n") are flattened to spaces so they don't break the snippet.
 */
function pageSearchText(publishedContent: string | null): string {
  const blocks = parsePublishedSnapshot(publishedContent);
  if (blocks.length === 0) return "";

  const parts: string[] = [];
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block.content);
    } catch {
      continue;
    }
    collectText(parsed, parts);
  }
  return stripHtml(parts.join(" ").replace(/\\n|\n/g, " "));
}

/** Builds a readable snippet centred on the first match of `query` in `text`. */
function buildSnippet(text: string, query: string): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return text.length > SNIPPET_MAX ? `${text.slice(0, SNIPPET_MAX).trimEnd()}…` : text;
  }

  let start = Math.max(0, index - SNIPPET_RADIUS);
  let end = Math.min(text.length, index + query.length + SNIPPET_RADIUS);

  // Avoid cutting mid-word where there's a nearby space.
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < index) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > index + query.length) end = space;
  }

  let snippet = text.slice(start, end).trim();
  if (snippet.length > SNIPPET_MAX) snippet = `${snippet.slice(0, SNIPPET_MAX).trimEnd()}…`;
  if (start > 0) snippet = `…${snippet}`;
  if (end < text.length) snippet = `${snippet}…`;
  return snippet;
}

/** A human-friendly slug → page title fallback (e.g. "collaborations-academic"). */
function titleForSlug(slug: string, dbTitle: string): string {
  if (dbTitle && dbTitle.trim()) return dbTitle.trim();
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [] });
  }

  if (q.length > 100) {
    return NextResponse.json(
      { error: "Query too long." },
      { status: 400 },
    );
  }

  try {
    const [studies, teamMembers, publications, pages] = await Promise.all([
      prisma.study.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q } },
            { shortDescription: { contains: q } },
            { category: { contains: q } },
          ],
        },
        select: {
          slug: true,
          title: true,
          shortDescription: true,
        },
        take: STUDY_TAKE,
      }),
      prisma.teamMember.findMany({
        where: {
          isVisible: true,
          OR: [
            { name: { contains: q } },
            { title: { contains: q } },
            { bio: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          title: true,
          profileUrl: true,
        },
        take: TEAM_TAKE,
      }),
      prisma.publication.findMany({
        where: {
          status: "Approved",
          isVisible: true,
          hiddenManually: false,
          OR: [
            { title: { contains: q } },
            { journal: { contains: q } },
            { authorsRaw: { contains: q } },
          ],
        },
        select: {
          title: true,
          journal: true,
          year: true,
          url: true,
          doi: true,
        },
        orderBy: { year: "desc" },
        take: PUBLICATION_TAKE,
      }),
      // Page-content search: SQLite `contains` is case-insensitive for ASCII, so
      // this prefilters pages whose published snapshot mentions the query. We
      // then extract a readable snippet from the parsed blocks in JS.
      prisma.page.findMany({
        where: { publishedContent: { contains: q } },
        select: {
          slug: true,
          title: true,
          publishedContent: true,
        },
        take: PAGE_CONTENT_TAKE,
      }),
    ]);

    const results: SearchResult[] = [];
    const seenHrefs = new Set<string>();

    for (const page of PAGES) {
      if (matchesPage(q, page)) {
        results.push({
          type: "page",
          title: page.title,
          snippet: page.snippet,
          href: page.href,
        });
        seenHrefs.add(page.href);
      }
    }

    for (const study of studies) {
      results.push({
        type: "study",
        title: study.title,
        snippet: study.shortDescription,
        href: `/studies/${study.slug}`,
      });
    }

    for (const member of teamMembers) {
      results.push({
        type: "team",
        title: member.name,
        snippet: member.title,
        href: getSafeHttpUrl(member.profileUrl) ?? "/team",
      });
    }

    for (const publication of publications) {
      const doiUrl = publication.doi
        ? getSafeHttpUrl(`https://doi.org/${publication.doi.replace(/^https?:\/\/doi\.org\//i, "")}`)
        : null;
      const href = getSafeHttpUrl(publication.url) ?? doiUrl ?? "/research";
      const snippet = [publication.journal, publication.year ? String(publication.year) : null]
        .filter(Boolean)
        .join(" · ");
      results.push({
        type: "publication",
        title: publication.title,
        snippet: snippet || "Publication",
        href,
      });
    }

    for (const page of pages) {
      const href = publicPath(page.slug);
      // A static PAGES entry already linked this destination for this query —
      // don't add a near-duplicate page-content row for it.
      if (seenHrefs.has(href)) continue;
      const text = pageSearchText(page.publishedContent);
      if (!text || !text.toLowerCase().includes(q.toLowerCase())) continue;
      results.push({
        type: "page-content",
        title: titleForSlug(page.slug, page.title),
        snippet: buildSnippet(text, q),
        href,
      });
      seenHrefs.add(href);
    }

    return NextResponse.json({ query: q, results: results.slice(0, RESULT_LIMIT) });
  } catch (error) {
    console.error("GET /api/search failed:", error);
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 },
    );
  }
}
