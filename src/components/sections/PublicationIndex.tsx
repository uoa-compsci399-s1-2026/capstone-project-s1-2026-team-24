"use client";

import { useEffect, useMemo, useState } from "react";

type PublicationAuthor = {
  id: number;
  order: number;
  teamMember: {
    id: number;
    name: string;
    title: string;
    section: string;
  };
};

type PublicationCategory = {
  id: number;
  name: string;
  order: number;
};

type Publication = {
  id: number;
  title: string;
  authorsRaw: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  pubType: string;
  url: string | null;
  abstract: string | null;
  affiliation: string | null;
  sourceType: string;
  sourceId: string | null;
  orcidSource: string | null;
  status: string;
  isVisible: boolean;
  hiddenManually: boolean;
  matchedKeywords: string;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: number | null;
  category: PublicationCategory | null;
  authors: PublicationAuthor[];
};

function buildPublicationUrl(publication: Publication) {
  if (publication.url) return publication.url;
  if (publication.doi) return `https://doi.org/${publication.doi}`;
  return null;
}

function buildAuthorsText(publication: Publication) {
  if (publication.authorsRaw.trim()) return publication.authorsRaw;
  return publication.authors.map((author) => author.teamMember.name).join(", ");
}

export default function PublicationIndex() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function loadPublications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/publications", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data: Publication[] = await response.json();
        if (!cancelled) setPublications(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load publications right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPublications();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableYears = useMemo(() => {
    const years = publications
      .map((p) => p.year)
      .filter((y): y is number => typeof y === "number")
      .sort((a, b) => b - a);
    return ["All", ...Array.from(new Set(years)).map(String)];
  }, [publications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((p) => {
      const matchesYear =
        selectedYear === "All" || String(p.year ?? "") === selectedYear;
      const searchable = [
        p.title,
        p.authorsRaw,
        p.journal ?? "",
        p.abstract ?? "",
        p.category?.name ?? "",
        p.pubType,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !q || searchable.includes(q);
      return matchesYear && matchesQuery;
    });
  }, [publications, query, selectedYear]);

  return (
    <section className="bg-white px-6 py-14 md:px-10 lg:px-[71px]">
      <div className="mx-auto max-w-[1412px]">
        <nav
          aria-label="Breadcrumb"
          className="text-[18px] text-[#0c0c48] mb-6 tracking-[0.36px]"
        >
          <ol className="flex items-center gap-2">
            <li>About</li>
            <li aria-hidden="true">&gt;</li>
            <li className="font-bold">Our Research</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Filters card */}
          <aside className="h-fit bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.12)] p-7">
            <h2 className="text-xl font-bold text-[#0c0c48] tracking-tight">
              Filters
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="publication-search"
                  className="mb-2 block text-sm font-semibold text-[#0a4479]"
                >
                  Search
                </label>
                <input
                  id="publication-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Title, author, journal..."
                  className="w-full px-4 py-2.5 border-2 border-[#cac7c7] rounded-full text-sm text-[#0c0c48] placeholder:text-[#8e8d8d] focus:outline-none focus:border-[#0a4479] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="publication-year"
                  className="mb-2 block text-sm font-semibold text-[#0a4479]"
                >
                  Year
                </label>
                <select
                  id="publication-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#cac7c7] rounded-full text-sm text-[#0c0c48] focus:outline-none focus:border-[#0a4479] transition-colors"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year === "All" ? "All years" : year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main content card */}
          <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.18)] p-8 sm:p-10">
            <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-[#0c0c48] tracking-[0.96px]">
                  Publications
                </h1>
                <p className="mt-3 text-base text-[#0a4479]/80 max-w-2xl">
                  Peer-reviewed research outputs from our team and collaborators
                  in nutrition, metabolism, and clinical trial design.
                </p>
              </div>
              {!loading && !error && (
                <p className="text-sm font-semibold text-[#0a4479]/70">
                  {filtered.length} result{filtered.length === 1 ? "" : "s"}
                </p>
              )}
            </header>

            {loading ? (
              <div className="bg-[#f5f5f7] rounded-2xl px-6 py-12 text-center text-[#0a4479]/80">
                Loading publications...
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-6 text-sm text-red-700">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-[#f5f5f7] rounded-2xl px-6 py-12 text-center text-[#0a4479]/80">
                No publications match your filters.
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((publication) => {
                  const publicationUrl = buildPublicationUrl(publication);
                  const authorsText = buildAuthorsText(publication);

                  return (
                    <article
                      key={publication.id}
                      className="bg-white rounded-[20px] border border-[#0a4479]/15 p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(10,68,121,0.12)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#0a4479]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0a4479]">
                              {publication.pubType}
                            </span>
                            {publication.category?.name && (
                              <span className="rounded-full bg-[#0c0c48]/5 px-3 py-1 text-xs font-medium text-[#0c0c48]/80">
                                {publication.category.name}
                              </span>
                            )}
                          </div>

                          <h2 className="text-lg sm:text-xl font-bold leading-snug text-[#0c0c48]">
                            {publication.title}
                          </h2>

                          <div className="mt-3 space-y-1 text-sm text-[#0a4479]/80">
                            {authorsText && <p>{authorsText}</p>}
                            <p className="italic">
                              {[publication.journal, publication.year]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </div>

                          {publication.abstract && (
                            <p className="mt-4 text-sm leading-6 text-[#3d3d3d]">
                              {publication.abstract}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            {publicationUrl && (
                              <a
                                href={publicationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center bg-[#0a4479] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#083559] transition-colors"
                              >
                                View publication
                              </a>
                            )}
                            {publication.doi && (
                              <span className="inline-flex items-center rounded-full border border-[#0a4479]/30 px-4 py-2 text-xs font-medium text-[#0a4479]">
                                DOI: {publication.doi}
                              </span>
                            )}
                          </div>
                        </div>

                        {publication.year && (
                          <div className="shrink-0 text-3xl font-extrabold text-[#0a4479]/40 tabular-nums">
                            {publication.year}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
