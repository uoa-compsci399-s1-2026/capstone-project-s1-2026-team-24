import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  study: { findMany: vi.fn() },
  teamMember: { findMany: vi.fn() },
  publication: { findMany: vi.fn() },
  page: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// Controllable rate-limit mock: allows by default so existing behaviour tests
// are unaffected; individual tests can force a 429.
const mockCheckRateLimit = vi.hoisted(() =>
  vi.fn(() => ({ allowed: true }) as { allowed: boolean; retryAfterSeconds?: number }),
);
// Keep the real rateLimitResponse; only stub checkRateLimit so we can force a 429.
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return { ...actual, checkRateLimit: mockCheckRateLimit };
});

import { GET as search, type SearchResult } from "@/app/api/search/route";

const req = (q: string) =>
  new NextRequest(`http://localhost/api/search?q=${encodeURIComponent(q)}`);

/** Default: every source returns nothing for this query. */
function mockEmpty() {
  mockPrisma.study.findMany.mockResolvedValue([]);
  mockPrisma.teamMember.findMany.mockResolvedValue([]);
  mockPrisma.publication.findMany.mockResolvedValue([]);
  mockPrisma.page.findMany.mockResolvedValue([]);
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: true });
  });

  it("returns an empty result set without querying the DB for queries under 2 chars", async () => {
    const res = await search(req("a"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ query: "a", results: [] });
    expect(mockPrisma.study.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.page.findMany).not.toHaveBeenCalled();
  });

  it("rejects queries longer than 100 characters", async () => {
    const res = await search(req("x".repeat(101)));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Query too long." });
    expect(mockPrisma.study.findMany).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After when the per-IP rate limit is exceeded", async () => {
    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      retryAfterSeconds: 42,
    });
    const res = await search(req("nutrition"));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
    await expect(res.json()).resolves.toEqual({
      error: "Too many requests. Please slow down.",
    });
    // The DB-heavy work must be skipped entirely when rate-limited.
    expect(mockPrisma.study.findMany).not.toHaveBeenCalled();
  });

  it("rate-limits using a per-IP search key", async () => {
    mockEmpty();
    await search(req("nutrition"));
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.stringMatching(/^search:/),
      expect.objectContaining({ max: expect.any(Number) }),
    );
  });

  it("matches the hardcoded PAGES list on title/keywords", async () => {
    mockEmpty();
    const res = await search(req("contact"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    expect(results).toContainEqual({
      type: "page",
      title: "Contact",
      snippet: "Get in touch with our team",
      href: "/contact",
    });
  });

  it("includes studies, team, publications and page-content in order", async () => {
    mockPrisma.study.findMany.mockResolvedValue([
      { slug: "nz-synergy", title: "NZ Synergy Study", shortDescription: "A nutrition study" },
    ]);
    mockPrisma.teamMember.findMany.mockResolvedValue([
      { id: 1, name: "Dr Nutrition", title: "Lead", profileUrl: null },
    ]);
    mockPrisma.publication.findMany.mockResolvedValue([
      {
        title: "Nutrition and metabolic health",
        journal: "Journal of Nutrition",
        year: 2025,
        url: "https://example.com/pub",
        doi: null,
      },
    ]);
    mockPrisma.page.findMany.mockResolvedValue([
      {
        slug: "about",
        title: "About",
        publishedContent: JSON.stringify([
          {
            type: "discoverVideo",
            content: JSON.stringify({
              cardTitle: "Who are we",
              cardParagraph1:
                "HNU is a University of Auckland nutrition research facility.",
            }),
          },
        ]),
      },
    ]);

    const res = await search(req("nutrition"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    const types = results.map((r) => r.type);

    // Group ordering: pages, studies, team, publications, page-content.
    expect(types.indexOf("study")).toBeLessThan(types.indexOf("team"));
    expect(types.indexOf("team")).toBeLessThan(types.indexOf("publication"));
    expect(types.indexOf("publication")).toBeLessThan(
      types.indexOf("page-content"),
    );

    expect(results).toContainEqual({
      type: "study",
      title: "NZ Synergy Study",
      snippet: "A nutrition study",
      href: "/studies/nz-synergy",
    });
    // No profile URL → falls back to /team.
    expect(results).toContainEqual({
      type: "team",
      title: "Dr Nutrition",
      snippet: "Lead",
      href: "/team",
    });
    expect(results).toContainEqual({
      type: "publication",
      title: "Nutrition and metabolic health",
      snippet: "Journal of Nutrition · 2025",
      href: "https://example.com/pub",
    });
  });

  it("filters publications to Approved + visible + not-hidden", async () => {
    mockEmpty();
    await search(req("nutrition"));
    expect(mockPrisma.publication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "Approved",
          isVisible: true,
          hiddenManually: false,
        }),
      }),
    );
  });

  it("links a publication to its DOI when there is no url", async () => {
    mockPrisma.study.findMany.mockResolvedValue([]);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.page.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([
      {
        title: "Obesity trial",
        journal: "Metabolites",
        year: null,
        url: null,
        doi: "10.3390/metabo15080522",
      },
    ]);

    const res = await search(req("obesity"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    const pub = results.find((r) => r.type === "publication");
    expect(pub?.href).toBe("https://doi.org/10.3390/metabo15080522");
    // Snippet drops the missing year.
    expect(pub?.snippet).toBe("Metabolites");
  });

  it("builds a page-content snippet from published block copy and strips HTML", async () => {
    mockPrisma.study.findMany.mockResolvedValue([]);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([]);
    mockPrisma.page.findMany.mockResolvedValue([
      {
        slug: "studies",
        title: "Studies",
        publishedContent: JSON.stringify([
          {
            type: "trialDesign",
            content: JSON.stringify({
              heading: "Trial Design",
              intro:
                "<p>The Human Nutrition Unit carries out intervention trials about diet and disease.</p>",
            }),
          },
        ]),
      },
    ]);

    const res = await search(req("intervention"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    const content = results.find((r) => r.type === "page-content");
    expect(content).toBeTruthy();
    expect(content?.href).toBe("/studies");
    expect(content?.title).toBe("Studies");
    expect(content?.snippet).toContain("intervention");
    // HTML tags are stripped out of the snippet.
    expect(content?.snippet).not.toContain("<p>");
  });

  it("does not duplicate a page already matched by the static PAGES list", async () => {
    mockPrisma.study.findMany.mockResolvedValue([]);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([]);
    // "research" matches the static PAGES entry (href /research). The page row
    // also resolves to /research, so it must be skipped to avoid a duplicate.
    mockPrisma.page.findMany.mockResolvedValue([
      {
        slug: "research",
        title: "Our Research",
        publishedContent: JSON.stringify([
          { type: "x", content: JSON.stringify({ body: "research research" }) },
        ]),
      },
    ]);

    const res = await search(req("research"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    const researchHrefs = results.filter((r) => r.href === "/research");
    expect(researchHrefs).toHaveLength(1);
    expect(researchHrefs[0].type).toBe("page");
  });

  it("includes never-published pages by searching their visible draft blocks", async () => {
    mockPrisma.study.findMany.mockResolvedValue([]);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([]);
    // publishedContent is null (never published), but the public renderer falls
    // back to the live blocks, so a draft-only page must still be searchable.
    mockPrisma.page.findMany.mockResolvedValue([
      {
        slug: "about",
        title: "About",
        publishedContent: null,
        blocks: [
          {
            content: JSON.stringify({
              heading: "Our facilities support metabolic research.",
            }),
          },
        ],
      },
    ]);

    const res = await search(req("metabolic"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    const content = results.find((r) => r.type === "page-content");
    expect(content).toBeTruthy();
    expect(content?.href).toBe("/about");
    expect(content?.snippet).toContain("metabolic");
  });

  it("does not surface an unpublished draft edit on an already-published page", async () => {
    mockPrisma.study.findMany.mockResolvedValue([]);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([]);
    // The published snapshot does NOT contain the query; only an unpublished draft
    // block does. Public visitors see the published snapshot, so search must not
    // leak the draft text.
    mockPrisma.page.findMany.mockResolvedValue([
      {
        slug: "team",
        title: "Our Team",
        publishedContent: JSON.stringify([
          { type: "x", content: JSON.stringify({ body: "Meet the team." }) },
        ]),
        blocks: [
          { content: JSON.stringify({ body: "draft keyword zzztopsecret" }) },
        ],
      },
    ]);

    const res = await search(req("zzztopsecret"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    expect(results.find((r) => r.type === "page-content")).toBeUndefined();
  });

  it("caps the overall result set at 20", async () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      slug: `s${i}`,
      title: `Study ${i} nutrition`,
      shortDescription: "desc",
    }));
    mockPrisma.study.findMany.mockResolvedValue(many);
    mockPrisma.teamMember.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        name: `Member ${i} nutrition`,
        title: "t",
        profileUrl: null,
      })),
    );
    mockPrisma.publication.findMany.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        title: `Pub ${i} nutrition`,
        journal: "J",
        year: 2025,
        url: null,
        doi: null,
      })),
    );
    mockPrisma.page.findMany.mockResolvedValue([]);

    const res = await search(req("nutrition"));
    const { results } = (await res.json()) as { results: SearchResult[] };
    expect(results.length).toBe(20);
  });

  it("returns 500 when a query throws", async () => {
    mockPrisma.study.findMany.mockRejectedValueOnce(new Error("db error"));
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.findMany.mockResolvedValue([]);
    mockPrisma.page.findMany.mockResolvedValue([]);

    const res = await search(req("nutrition"));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Search failed." });
  });
});
