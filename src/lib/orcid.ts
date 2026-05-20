const ORCID_API_BASE_URL =
  process.env.ORCID_API_BASE_URL?.replace(/\/$/, "") ??
  "https://pub.sandbox.orcid.org/v3.0";

type OrcidWorksResponse = {
  group?: Array<{
    "work-summary"?: OrcidWorkSummary[];
  }>;
};

type OrcidWorkSummary = {
  "put-code"?: number;
  title?: {
    title?: {
      value?: string;
    };
  };
  type?: string;
  "journal-title"?: {
    value?: string;
  } | null;
  "publication-date"?: {
    year?: {
      value?: string;
    } | null;
  } | null;
  url?: {
    value?: string;
  } | null;
  path?: string;
  visibility?: string;
};

type OrcidExternalId = {
  "external-id-type"?: string;
  "external-id-value"?: string;
  "external-id-url"?: {
    value?: string;
  } | null;
};

type OrcidWorkDetailResponse = {
  "put-code"?: number;
  title?: {
    title?: {
      value?: string;
    };
  };
  type?: string;
  "journal-title"?: {
    value?: string;
  } | null;
  "publication-date"?: {
    year?: {
      value?: string;
    } | null;
  } | null;
  url?: {
    value?: string;
  } | null;
  "short-description"?: string | null;
  "external-ids"?: {
    "external-id"?: OrcidExternalId[];
  };
};

export type OrcidWorkSummaryItem = {
  putCode: number;
  title: string;
  type: string;
  journal: string | null;
  year: number | null;
  url: string | null;
  visibility: string | null;
  path: string | null;
};

export type OrcidWorkDetailItem = {
  putCode: number;
  title: string;
  type: string;
  journal: string | null;
  year: number | null;
  url: string | null;
  abstract: string | null;
  doi: string | null;
  externalIds: Array<{
    type: string;
    value: string;
    url: string | null;
  }>;
};

export type NormalizedOrcidWork = {
  sourceType: "ORCID";
  sourceId: string;
  title: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  pubType: string;
  url: string | null;
  abstract: string | null;
};

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseYear(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function humanizeWorkType(value: string | null): string {
  if (!value) return "Unknown";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDoiFromExternalIds(
  externalIds: Array<{ type: string; value: string; url: string | null }>,
): string | null {
  const doi = externalIds.find(
    (item) => item.type.toLowerCase() === "doi" && item.value,
  );
  return doi?.value ?? null;
}

async function fetchOrcidJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ORCID_API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `ORCID request failed: ${response.status} ${response.statusText} ${text}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchOrcidWorksSummary(
  orcidId: string,
): Promise<OrcidWorkSummaryItem[]> {
  const cleanOrcidId = orcidId.trim();
  const data = await fetchOrcidJson<OrcidWorksResponse>(`/${cleanOrcidId}/works`);

  const groups = data.group ?? [];

  return groups.flatMap((group) =>
    (group["work-summary"] ?? [])
      .map((summary) => {
        const putCode = summary["put-code"];
        if (!putCode) return null;

        return {
          putCode,
          title: asNonEmptyString(summary.title?.title?.value) ?? "Untitled work",
          type: asNonEmptyString(summary.type) ?? "unknown",
          journal: asNonEmptyString(summary["journal-title"]?.value ?? null),
          year: parseYear(
            asNonEmptyString(
              summary["publication-date"]?.year?.value ?? null,
            ),
          ),
          url: asNonEmptyString(summary.url?.value ?? null),
          visibility: asNonEmptyString(summary.visibility ?? null),
          path: asNonEmptyString(summary.path ?? null),
        };
      })
      .filter((item): item is OrcidWorkSummaryItem => item !== null),
  );
}

export async function fetchOrcidWorkDetail(
  orcidId: string,
  putCode: number,
): Promise<OrcidWorkDetailItem> {
  const cleanOrcidId = orcidId.trim();
  const data = await fetchOrcidJson<OrcidWorkDetailResponse>(
    `/${cleanOrcidId}/work/${putCode}`,
  );

  const externalIds =
    data["external-ids"]?.["external-id"]?.flatMap((item) => {
      const type = asNonEmptyString(item["external-id-type"]);
      const value = asNonEmptyString(item["external-id-value"]);
      if (!type || !value) return [];

      return [
        {
          type,
          value,
          url: asNonEmptyString(item["external-id-url"]?.value ?? null),
        },
      ];
    }) ?? [];

  return {
    putCode,
    title: asNonEmptyString(data.title?.title?.value) ?? "Untitled work",
    type: asNonEmptyString(data.type) ?? "unknown",
    journal: asNonEmptyString(data["journal-title"]?.value ?? null),
    year: parseYear(
      asNonEmptyString(data["publication-date"]?.year?.value ?? null),
    ),
    url: asNonEmptyString(data.url?.value ?? null),
    abstract: asNonEmptyString(data["short-description"] ?? null),
    doi: getDoiFromExternalIds(externalIds),
    externalIds,
  };
}

export async function fetchNormalizedOrcidWorks(
  orcidId: string,
): Promise<NormalizedOrcidWork[]> {
  const summaries = await fetchOrcidWorksSummary(orcidId);

  const detailedWorks = await Promise.all(
    summaries.map(async (summary) => {
      try {
        const detail = await fetchOrcidWorkDetail(orcidId, summary.putCode);

        return {
          sourceType: "ORCID" as const,
          sourceId: String(summary.putCode),
          title: detail.title,
          journal: detail.journal,
          year: detail.year,
          doi: detail.doi,
          pubType: humanizeWorkType(detail.type),
          url: detail.url,
          abstract: detail.abstract,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ORCID work detail for ${orcidId} put-code ${summary.putCode}:`,
          error,
        );

        return {
          sourceType: "ORCID" as const,
          sourceId: String(summary.putCode),
          title: summary.title,
          journal: summary.journal,
          year: summary.year,
          doi: null,
          pubType: humanizeWorkType(summary.type),
          url: summary.url,
          abstract: null,
        };
      }
    }),
  );

  return detailedWorks;
}