import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_AFFILIATION_PHRASES,
  DEFAULT_EXCLUSION_KEYWORDS,
  DEFAULT_INSTITUTION_RORS,
  DEFAULT_STRONG_KEYWORDS,
  DEFAULT_WEAK_KEYWORDS,
} from "@/lib/publication-filter";

// --- Mocks ---------------------------------------------------------------

const mockPrisma = vi.hoisted(() => ({
  publicationFilterSetting: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  teamMember: {
    findMany: vi.fn(),
  },
  publication: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  deletedPublication: {
    findMany: vi.fn(),
  },
  publicationAuthor: {
    upsert: vi.fn(),
  },
}));

const mockOrcid = vi.hoisted(() => ({
  fetchNormalizedOrcidWorks: vi.fn(),
}));

const mockOpenAlex = vi.hoisted(() => ({
  fetchOrcidAffiliations: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/orcid", () => mockOrcid);
// Mock only fetchOrcidAffiliations; keep the real lookupAffiliation so the map
// keying/lookup logic is exercised.
vi.mock("@/lib/openalex", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/openalex")>("@/lib/openalex");
  return {
    ...actual,
    fetchOrcidAffiliations: mockOpenAlex.fetchOrcidAffiliations,
  };
});

import { POST as syncPost } from "@/app/api/admin/publications/sync/route";
import {
  buildPublicationDedupKey,
  type PublicationFilterConfig,
} from "@/lib/publication-filter";

// A persisted singleton row mirroring the seeded defaults.
const settingRow = {
  id: 1,
  minYear: 1998,
  affiliationPhrases: DEFAULT_AFFILIATION_PHRASES.join("\n"),
  institutionRors: DEFAULT_INSTITUTION_RORS.join("\n"),
  strongKeywords: DEFAULT_STRONG_KEYWORDS.join("\n"),
  weakKeywords: DEFAULT_WEAK_KEYWORDS.join("\n"),
  exclusionKeywords: DEFAULT_EXCLUSION_KEYWORDS.join("\n"),
  updatedAt: new Date(),
};

type WorkInput = {
  sourceId: string;
  title: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  pubType: string;
  abstract: string | null;
  url: string | null;
};

function work(partial: Partial<WorkInput> & { title: string }): WorkInput & {
  sourceType: "ORCID";
} {
  return {
    sourceType: "ORCID",
    sourceId: partial.sourceId ?? partial.title,
    title: partial.title,
    journal: partial.journal ?? null,
    year: partial.year ?? 2022,
    doi: partial.doi ?? null,
    pubType: partial.pubType ?? "Journal Article",
    abstract: partial.abstract ?? null,
    url: partial.url ?? null,
  };
}

// Loosely-typed shapes for the Prisma call payloads we assert against. The real
// generated types are far richer; we only read a handful of fields here.
type CreateArgs = { data: Record<string, unknown> };
type UpdateArgs = { where: { id: number }; data: Record<string, unknown> };

// Capture-created rows so we can assert the status the sync chose.
let createdRows: Array<{
  title: string;
  status: string;
  data: Record<string, unknown>;
}>;

function setupHappyPath(opts: {
  members: Array<{ id: number; name: string; orcidId: string }>;
  existing?: Array<{
    id: number;
    title: string;
    year: number | null;
    doi: string | null;
    authorsRaw: string;
    reviewedManually: boolean;
    status: string;
  }>;
}) {
  createdRows = [];
  mockPrisma.publicationFilterSetting.findFirst.mockResolvedValue(settingRow);
  mockPrisma.teamMember.findMany.mockResolvedValue(opts.members);

  const existing = opts.existing ?? [];
  mockPrisma.publication.findMany.mockResolvedValue(
    existing.map((e) => ({
      id: e.id,
      title: e.title,
      year: e.year,
      doi: e.doi,
      authorsRaw: e.authorsRaw,
      reviewedManually: e.reviewedManually,
    })),
  );
  mockPrisma.publication.count.mockResolvedValue(existing.length);

  let nextId = 1000;
  mockPrisma.publication.create.mockImplementation((args: CreateArgs) => {
    const { data } = args;
    const row = { id: nextId++, ...data };
    createdRows.push({
      title: String(data.title),
      status: String(data.status),
      data,
    });
    return Promise.resolve(row);
  });

  mockPrisma.publication.update.mockImplementation((args: UpdateArgs) => {
    const { where, data } = args;
    const match = existing.find((e) => e.id === where.id);
    // Emulate the conditional status guard: when reviewedManually is set on the
    // row, the route omits `status` from `data`, so the stored value is kept.
    const status = "status" in data ? data.status : match?.status;
    return Promise.resolve({
      id: where.id,
      title: data.title ?? match?.title,
      year: data.year ?? match?.year ?? null,
      doi: data.doi ?? match?.doi ?? null,
      authorsRaw: data.authorsRaw ?? match?.authorsRaw ?? "",
      reviewedManually: match?.reviewedManually ?? false,
      status,
    });
  });

  mockPrisma.publicationAuthor.upsert.mockResolvedValue({});
  // No tombstones by default; tombstone tests override this.
  mockPrisma.deletedPublication.findMany.mockResolvedValue([]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ORCID sync — relevance & review preservation", () => {
  it("rejects a pre-1998 work (stored as Rejected so it's reviewable)", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({ title: "Old nutrition study", year: 1990, sourceId: "w1" }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
    });

    const res = await syncPost();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skippedBeforeYear).toBe(1);
    const created = createdRows.find((r) => r.title === "Old nutrition study");
    expect(created?.status).toBe("Rejected");
    expect(created?.data.relevanceReason).toContain("before 1998");
  });

  it("approves a work whose OpenAlex affiliation names the unit", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({
        title: "Marine sediment cores",
        year: 2022,
        doi: "10.1/unit",
        sourceId: "w2",
      }),
    ]);
    const affMap = new Map([
      [
        "10.1/unit",
        {
          rors: ["03b94tp07"],
          rawAffiliationStrings: [
            "Human Nutrition Unit, University of Auckland",
          ],
        },
      ],
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(affMap);
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
    });

    const res = await syncPost();
    const body = await res.json();
    expect(body.created).toBe(1);
    const created = createdRows.find((r) => r.title === "Marine sediment cores");
    expect(created?.status).toBe("Approved");
    expect(created?.data.matchedAffiliation).toContain("Human Nutrition Unit");
  });

  it("does NOT auto-approve a UoA-ROR-only work (seabird-researcher case → Pending)", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({
        title: "Breeding ecology of grey-faced petrels",
        year: 2023,
        doi: "10.1/bird",
        sourceId: "w3",
      }),
    ]);
    const affMap = new Map([
      [
        "10.1/bird",
        {
          rors: ["03b94tp07"],
          rawAffiliationStrings: [
            "School of Biological Sciences, University of Auckland",
          ],
        },
      ],
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(affMap);
    setupHappyPath({
      members: [{ id: 1, name: "Dr Bird", orcidId: "0000-0001-9029-0694" }],
    });

    const res = await syncPost();
    await res.json();
    const created = createdRows.find((r) =>
      r.title.startsWith("Breeding ecology"),
    );
    expect(created?.status).toBe("Pending");
    expect(created?.status).not.toBe("Approved");
  });

  it("preserves a manually-reviewed status on re-sync (does not clobber)", async () => {
    // Work classifies as Approved, but the existing row was manually Rejected.
    const title = "A randomised controlled trial of a low-energy diet";
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({ title, year: 2021, doi: "10.1/keep", sourceId: "w4" }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
      existing: [
        {
          id: 7,
          title,
          year: 2021,
          doi: "10.1/keep",
          authorsRaw: "Dr Test",
          reviewedManually: true,
          status: "Rejected",
        },
      ],
    });

    const res = await syncPost();
    const body = await res.json();
    expect(body.updated).toBe(1);

    // The update call for the reviewed row must NOT include `status`.
    const updateCall = mockPrisma.publication.update.mock.calls.find(
      (c) => (c[0] as UpdateArgs).where.id === 7,
    );
    expect(updateCall).toBeDefined();
    expect("status" in (updateCall![0] as UpdateArgs).data).toBe(false);
  });

  it("DOES update status on re-sync when the row was not manually reviewed", async () => {
    const title = "Dietary nutrition and metabolic health outcomes";
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({ title, year: 2021, doi: "10.1/auto", sourceId: "w5" }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
      existing: [
        {
          id: 9,
          title,
          year: 2021,
          doi: "10.1/auto",
          authorsRaw: "Dr Test",
          reviewedManually: false,
          status: "Pending",
        },
      ],
    });

    await syncPost();
    const updateCall = mockPrisma.publication.update.mock.calls.find(
      (c) => (c[0] as UpdateArgs).where.id === 9,
    );
    expect(updateCall).toBeDefined();
    // Auto rows get their status refreshed (>=2 strong keywords → Approved).
    expect((updateCall![0] as UpdateArgs).data.status).toBe("Approved");
  });

  it("returns a friendly message when no members have an ORCID iD", async () => {
    mockPrisma.publicationFilterSetting.findFirst.mockResolvedValue(settingRow);
    mockPrisma.teamMember.findMany.mockResolvedValue([]);
    mockPrisma.publication.count.mockResolvedValue(0);

    const res = await syncPost();
    const body = await res.json();
    expect(body.syncedMembers).toBe(0);
    expect(body.message).toContain("No visible team members");
  });
});

describe("ORCID sync — tombstones (hard-delete permanence)", () => {
  it("skips a work whose DOI matches a tombstone (no resurrection)", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      // Same paper, mixed-case DOI, brand-new put-code — would normally be created.
      work({
        title: "Deleted nutrition paper",
        year: 2022,
        doi: "10.1/DEAD",
        sourceId: "w-new",
      }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
    });
    mockPrisma.deletedPublication.findMany.mockResolvedValue([
      {
        sourceType: "ORCID",
        sourceId: "0000-0001-0000-0001:w-old",
        doi: "10.1/dead",
        titleYearKey: null,
      },
    ]);

    const res = await syncPost();
    const body = await res.json();
    expect(body.skippedDeleted).toBe(1);
    expect(body.created).toBe(0);
    expect(mockPrisma.publication.create).not.toHaveBeenCalled();
  });

  it("skips a DOI-less work matching a tombstone title+year key (put-code drift)", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      // No DOI and a different sourceId than the deleted row: only the title+year
      // key can catch this — the case the user worried about.
      work({
        title: "Diet study without a DOI",
        year: 2019,
        doi: null,
        sourceId: "w-brand-new",
      }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
    });
    mockPrisma.deletedPublication.findMany.mockResolvedValue([
      {
        sourceType: "ORCID",
        sourceId: "0000-0001-0000-0001:w-old",
        doi: null,
        titleYearKey: buildPublicationDedupKey({
          title: "Diet study without a DOI",
          year: 2019,
        }),
      },
    ]);

    const res = await syncPost();
    const body = await res.json();
    expect(body.skippedDeleted).toBe(1);
    expect(mockPrisma.publication.create).not.toHaveBeenCalled();
  });

  it("still creates a non-tombstoned work when an unrelated tombstone exists", async () => {
    mockOrcid.fetchNormalizedOrcidWorks.mockResolvedValue([
      work({
        title: "Fresh nutrition trial",
        year: 2023,
        doi: "10.1/fresh",
        sourceId: "w-fresh",
      }),
    ]);
    mockOpenAlex.fetchOrcidAffiliations.mockResolvedValue(new Map());
    setupHappyPath({
      members: [{ id: 1, name: "Dr Test", orcidId: "0000-0001-0000-0001" }],
    });
    mockPrisma.deletedPublication.findMany.mockResolvedValue([
      {
        sourceType: "ORCID",
        sourceId: "0000-0001-0000-0001:w-other",
        doi: "10.1/other",
        titleYearKey: "some other paper::2010",
      },
    ]);

    const res = await syncPost();
    const body = await res.json();
    expect(body.skippedDeleted).toBe(0);
    expect(body.created).toBe(1);
    expect(
      createdRows.find((r) => r.title === "Fresh nutrition trial"),
    ).toBeDefined();
  });
});

// A tiny guard so the imports above are exercised even if a test is skipped.
describe("test helpers", () => {
  it("dedup key + config types are importable", () => {
    expect(buildPublicationDedupKey({ title: "X", year: 2000 })).toBe(
      "x::2000",
    );
    const cfg: PublicationFilterConfig | null = null;
    expect(cfg).toBeNull();
  });
});
