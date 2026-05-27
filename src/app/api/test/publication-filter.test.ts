import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTER_CONFIG,
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

  it("approves when an accepted institution co-occurs with a strong keyword", () => {
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
    expect(result.status).toBe("Approved");
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
    // strong keywords ("glycaemic", "appetite") -> approved regardless, but the
    // ROR URL should also be recognised as a match.
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
});
