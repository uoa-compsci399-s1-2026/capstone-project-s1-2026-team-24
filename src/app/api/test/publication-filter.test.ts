import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTER_CONFIG,
  DEFAULT_ROUTES,
  classifyPublicationRelevance,
  configFromRow,
  parseLines,
} from "@/lib/publication-filter";

describe("classifyPublicationRelevance", () => {
  it("rejects works published before the minimum year", () => {
    const result = classifyPublicationRelevance(
      {
        title: "Dietary nutrition and metabolic health",
        journal: "Nutrition Journal",
        abstract: null,
        pubType: "Journal Article",
        year: 1995,
        affiliationStrings: ["Human Nutrition Unit, University of Auckland"],
        rors: ["03b94tp07"],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Rejected");
    expect(result.reason).toContain("before 1998");
  });

  it("approves a work whose affiliation names the unit", () => {
    const result = classifyPublicationRelevance(
      {
        // Deliberately off-topic title with no keyword: affiliation alone approves.
        title: "A study of marine sediment cores",
        journal: "Geology Today",
        abstract: null,
        pubType: "Journal Article",
        year: 2022,
        affiliationStrings: [
          "Human Nutrition Unit, School of Biological Sciences, University of Auckland",
        ],
        rors: ["03b94tp07"],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Approved");
    expect(result.matchedAffiliation).toContain("Human Nutrition Unit");
  });

  it("does NOT auto-approve a UoA-ROR-only work with no unit phrasing or keyword", () => {
    // The seabird-researcher case: University of Auckland (ROR match) but the
    // affiliation is a different school and the title is off-field.
    const result = classifyPublicationRelevance(
      {
        title: "Breeding ecology of grey-faced petrels",
        journal: "Marine Ornithology",
        abstract: null,
        pubType: "Journal Article",
        year: 2023,
        affiliationStrings: [
          "School of Biological Sciences, University of Auckland",
        ],
        rors: ["03b94tp07"],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).not.toBe("Approved");
    expect(result.status).toBe("Pending");
    expect(result.matchedAffiliation).toContain("03b94tp07");
  });

  it("rejects off-field works with no affiliation and no keywords", () => {
    const result = classifyPublicationRelevance(
      {
        title: "Breeding ecology of grey-faced petrels",
        journal: "Marine Ornithology",
        abstract: null,
        pubType: "Journal Article",
        year: 2023,
        affiliationStrings: [],
        rors: [],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Rejected");
  });

  it("sends an institution + strong-keyword work to Pending under the default policy", () => {
    // P1: without a unit-name match, a strong keyword (even with an accepted
    // institution) no longer auto-approves — it waits for a human in Pending.
    const result = classifyPublicationRelevance(
      {
        title: "A randomised controlled trial of a low-energy diet",
        journal: "Diabetes Care",
        abstract: null,
        pubType: "Journal Article",
        year: 2021,
        // No unit phrasing, but UoA ROR + strong keywords present.
        affiliationStrings: ["University of Auckland"],
        rors: ["03b94tp07"],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Pending");
  });

  it("sends a strong-keyword-only work (no affiliation) to Pending under the default policy", () => {
    // P1: two strong keywords with no affiliation match used to auto-approve;
    // now it lands in Pending.
    const result = classifyPublicationRelevance(
      {
        title: "Dietary nutrition and metabolic outcomes",
        journal: "Some Journal",
        abstract: null,
        pubType: "Journal Article",
        year: 2022,
        affiliationStrings: [],
        rors: [],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Pending");
  });

  it("rejects an excluded-term work when no strong signal counters it", () => {
    const result = classifyPublicationRelevance(
      {
        title: "Canine veterinary care in companion dogs",
        journal: "Veterinary Journal",
        abstract: null,
        pubType: "Journal Article",
        year: 2020,
        affiliationStrings: [],
        rors: [],
      },
      DEFAULT_FILTER_CONFIG,
    );
    expect(result.status).toBe("Rejected");
    expect(result.reason).toContain("excluded");
  });

  it("normalises ROR URLs when matching the institution list", () => {
    const result = classifyPublicationRelevance(
      {
        title: "Glycaemic response and appetite regulation",
        journal: "Appetite",
        abstract: null,
        pubType: "Journal Article",
        year: 2022,
        affiliationStrings: ["University of Auckland"],
        rors: ["https://ror.org/03b94tp07"],
      },
      DEFAULT_FILTER_CONFIG,
    );
    // The ROR URL form ("https://ror.org/03b94tp07") should be normalised and
    // recognised as an institution match.
    expect(result.matchedAffiliation).toContain("03b94tp07");
  });
});

describe("parseLines / configFromRow", () => {
  it("splits newline- and comma-separated lists and trims blanks", () => {
    expect(parseLines("a\n b \n\n,c,")).toEqual(["a", "b", "c"]);
    expect(parseLines("")).toEqual([]);
    expect(parseLines(null)).toEqual([]);
  });

  it("falls back to defaults for empty list fields", () => {
    const config = configFromRow({
      minYear: 2000,
      affiliationPhrases: "",
      institutionRors: "",
      strongKeywords: "custom keyword",
      weakKeywords: "",
      exclusionKeywords: "",
    });
    expect(config.minYear).toBe(2000);
    expect(config.strongKeywords).toEqual(["custom keyword"]);
    // Empty fields fall back to the shared defaults.
    expect(config.affiliationPhrases).toContain("Human Nutrition Unit");
    expect(config.institutionRors).toContain("03b94tp07");
  });

  it("ignores a non-positive minYear and uses the default", () => {
    const config = configFromRow({
      minYear: 0,
      affiliationPhrases: "",
      institutionRors: "",
      strongKeywords: "",
      weakKeywords: "",
      exclusionKeywords: "",
    });
    expect(config.minYear).toBe(DEFAULT_FILTER_CONFIG.minYear);
  });

  it("defaults the routes when route fields are missing", () => {
    const config = configFromRow({
      minYear: 2000,
      affiliationPhrases: "",
      institutionRors: "",
      strongKeywords: "",
      weakKeywords: "",
      exclusionKeywords: "",
    });
    expect(config.routes).toEqual(DEFAULT_ROUTES);
  });

  it("parses valid route values and falls back to a default for an invalid one", () => {
    const config = configFromRow({
      minYear: 2000,
      affiliationPhrases: "",
      institutionRors: "",
      strongKeywords: "",
      weakKeywords: "",
      exclusionKeywords: "",
      routeStrongKeywords: "Approved",
      routeExclusion: "not-a-bucket",
    });
    expect(config.routes.strongKeywords).toBe("Approved");
    // Invalid value reverts to the default for that rule.
    expect(config.routes.exclusion).toBe(DEFAULT_ROUTES.exclusion);
  });
});

describe("classifyPublicationRelevance — configurable routes", () => {
  it("auto-approves a strong-keyword work when routes.strongKeywords is Approved", () => {
    const config = {
      ...DEFAULT_FILTER_CONFIG,
      routes: { ...DEFAULT_ROUTES, strongKeywords: "Approved" as const },
    };
    const result = classifyPublicationRelevance(
      {
        title: "Dietary nutrition and metabolic outcomes",
        journal: "Some Journal",
        abstract: null,
        pubType: "Journal Article",
        year: 2022,
        affiliationStrings: [],
        rors: [],
      },
      config,
    );
    expect(result.reasonCode).toBe("STRONG_KEYWORDS");
    expect(result.status).toBe("Approved");
  });

  it("routes an excluded-term work to Pending when routes.exclusion is Pending", () => {
    const config = {
      ...DEFAULT_FILTER_CONFIG,
      routes: { ...DEFAULT_ROUTES, exclusion: "Pending" as const },
    };
    const result = classifyPublicationRelevance(
      {
        title: "Canine veterinary care in companion dogs",
        journal: "Veterinary Journal",
        abstract: null,
        pubType: "Journal Article",
        year: 2020,
        affiliationStrings: [],
        rors: [],
      },
      config,
    );
    expect(result.reasonCode).toBe("EXCLUDED");
    expect(result.status).toBe("Pending");
  });

  it("still rejects pre-cutoff and no-signal works regardless of routes", () => {
    const config = {
      ...DEFAULT_FILTER_CONFIG,
      // Even with everything pointed at Approved, the hard cases stay Rejected.
      routes: {
        unitAffiliation: "Approved" as const,
        institutionKeyword: "Approved" as const,
        strongKeywords: "Approved" as const,
        weakMatch: "Approved" as const,
        exclusion: "Approved" as const,
      },
    };
    const beforeYear = classifyPublicationRelevance(
      {
        title: "Nutrition and diet",
        journal: null,
        abstract: null,
        pubType: "Journal Article",
        year: 1990,
        affiliationStrings: [],
        rors: [],
      },
      config,
    );
    expect(beforeYear.status).toBe("Rejected");
    expect(beforeYear.reasonCode).toBe("BEFORE_MIN_YEAR");

    const noSignal = classifyPublicationRelevance(
      {
        title: "Breeding ecology of grey-faced petrels",
        journal: "Marine Ornithology",
        abstract: null,
        pubType: "Journal Article",
        year: 2023,
        affiliationStrings: [],
        rors: [],
      },
      config,
    );
    expect(noSignal.status).toBe("Rejected");
    expect(noSignal.reasonCode).toBe("NO_SIGNAL");
  });

  it("does not tag a re-routed weak match as 'needs review' in the reason", () => {
    const config = {
      ...DEFAULT_FILTER_CONFIG,
      routes: { ...DEFAULT_ROUTES, weakMatch: "Approved" as const },
    };
    const result = classifyPublicationRelevance(
      {
        // Exactly one strong keyword, no affiliation -> SINGLE_STRONG_KEYWORD.
        title: "A study of nutrition",
        journal: null,
        abstract: null,
        pubType: "Journal Article",
        year: 2022,
        affiliationStrings: [],
        rors: [],
      },
      config,
    );
    expect(result.reasonCode).toBe("SINGLE_STRONG_KEYWORD");
    expect(result.status).toBe("Approved");
    // The reason must not contradict an Approved/Rejected badge.
    expect(result.reason).not.toContain("needs review");
  });
});
