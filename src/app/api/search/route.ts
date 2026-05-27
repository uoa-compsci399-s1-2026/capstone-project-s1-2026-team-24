import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSafeHttpUrl } from "@/lib/safe-url";

export type SearchResult = {
  type: "study" | "team" | "page";
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
    const [studies, teamMembers] = await Promise.all([
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
        take: 8,
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
        take: 8,
      }),
    ]);

    const results: SearchResult[] = [];

    for (const page of PAGES) {
      if (matchesPage(q, page)) {
        results.push({
          type: "page",
          title: page.title,
          snippet: page.snippet,
          href: page.href,
        });
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

    return NextResponse.json({ query: q, results: results.slice(0, 20) });
  } catch (error) {
    console.error("GET /api/search failed:", error);
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 },
    );
  }
}
