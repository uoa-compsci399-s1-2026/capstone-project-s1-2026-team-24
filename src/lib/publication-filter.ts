export type PublicationRelevanceResult = {
    status: "Approved" | "Pending" | "Rejected";
    matchedKeywords: string[];
  };
  
  const STRONG_HNU_KEYWORDS = [
    "nutrition",
    "nutritional",
    "diet",
    "dietary",
    "metabolism",
    "metabolic",
    "glycaemic",
    "glycemic",
    "prediabetes",
    "pre-diabetes",
    "diabetes",
    "obesity",
    "appetite",
    "satiety",
    "body composition",
    "energy expenditure",
    "cardiometabolic",
    "pancreatic fat",
    "intra-pancreatic fat",
    "clinical trial",
    "randomized",
    "randomised",
    "whey protein",
    "microbiota",
    "gut microbiota",
    "food",
    "rice",
    "protein diet",
    "low-energy diet",
    "preview",
    "tofi",
    "tofi_asia",
    "tū ora",
    "tu ora",
    "synergy study",
  ];
  
  const WEAK_HNU_KEYWORDS = [
    "health",
    "weight loss",
    "overweight",
    "insulin",
    "glucose",
    "cholesterol",
    "fat",
    "bariatric",
  ];
  
  const EXCLUSION_KEYWORDS = [
    "dog",
    "dogs",
    "canine",
    "veterinary",
    "parkinson",
    "alzheimer",
    "huntington",
    "schizophrenia",
    "stroke",
    "amyotrophic lateral sclerosis",
    "frontotemporal dementia",
  ];
  
  function normalizeText(input: string) {
    return input
      .toLowerCase()
      .replace(/&ldquo;|&rdquo;|&mdash;|&ndash;|&beta;|ß/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  export function normalizePublicationTitle(title: string) {
    return normalizeText(title);
  }
  
  export function buildPublicationDedupKey(input: {
    title: string;
    year: number | null;
  }) {
    return `${normalizePublicationTitle(input.title)}::${input.year ?? "unknown"}`;
  }
  
  export function classifyPublicationRelevance(input: {
    title: string;
    journal: string | null;
    abstract: string | null;
    pubType: string;
  }): PublicationRelevanceResult {
    const searchableText = normalizeText(
      [input.title, input.journal ?? "", input.abstract ?? "", input.pubType].join(" "),
    );
  
    const matchedStrong = STRONG_HNU_KEYWORDS.filter((keyword) =>
      searchableText.includes(normalizeText(keyword)),
    );
  
    const matchedWeak = WEAK_HNU_KEYWORDS.filter((keyword) =>
      searchableText.includes(normalizeText(keyword)),
    );
  
    const matchedExcluded = EXCLUSION_KEYWORDS.filter((keyword) =>
      searchableText.includes(normalizeText(keyword)),
    );
  
    const matchedKeywords = [...matchedStrong, ...matchedWeak];
  
    if (matchedExcluded.length > 0 && matchedStrong.length === 0) {
      return {
        status: "Rejected",
        matchedKeywords,
      };
    }
  
    if (matchedStrong.length >= 1) {
      return {
        status: "Approved",
        matchedKeywords,
      };
    }
  
    if (matchedWeak.length >= 2) {
      return {
        status: "Pending",
        matchedKeywords,
      };
    }
  
    return {
      status: "Rejected",
      matchedKeywords,
    };
  }