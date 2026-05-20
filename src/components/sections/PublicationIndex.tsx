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
  const names = publication.authors.map((author) => author.teamMember.name);
  return names.join(", ");
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

        if (!cancelled) {
          setPublications(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load publications right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPublications();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableYears = useMemo(() => {
    const years = publications
      .map((publication) => publication.year)
      .filter((year): year is number => typeof year === "number")
      .sort((a, b) => b - a);

    return ["All", ...Array.from(new Set(years)).map(String)];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return publications.filter((publication) => {
      const matchesYear =
        selectedYear === "All" || String(publication.year ?? "") === selectedYear;

      const searchableText = [
        publication.title,
        publication.authorsRaw,
        publication.journal ?? "",
        publication.abstract ?? "",
        publication.category?.name ?? "",
        publication.pubType,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesYear && matchesQuery;
    });
  }, [publications, query, selectedYear]);

  return (
    <section className="bg-white px-6 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="publication-search"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Search
                </label>
                <input
                  id="publication-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search publications..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="publication-year"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Publication year
                </label>
                <select
                  id="publication-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
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

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Publications
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Browse HNU-relevant research outputs from our team and collaborators.
                  </p>
                </div>

                {!loading && !error ? (
                  <p className="text-sm text-slate-500">
                    {filteredPublications.length} result
                    {filteredPublications.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>

              <div className="mt-8">
                {loading ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    Loading publications...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                    {error}
                  </div>
                ) : filteredPublications.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    No publications found yet.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredPublications.map((publication) => {
                      const publicationUrl = buildPublicationUrl(publication);
                      const authorsText = buildAuthorsText(publication);

                      return (
                        <article
                          key={publication.id}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                  {publication.pubType}
                                </span>
                                {publication.category?.name ? (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    {publication.category.name}
                                  </span>
                                ) : null}
                              </div>

                              <h2 className="text-xl font-semibold leading-snug text-slate-900">
                                {publication.title}
                              </h2>

                              <div className="mt-3 space-y-1 text-sm text-slate-600">
                                {authorsText ? <p>{authorsText}</p> : null}
                                <p>
                                  {[publication.journal, publication.year]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              </div>

                              {publication.abstract ? (
                                <p className="mt-4 text-sm leading-6 text-slate-700">
                                  {publication.abstract}
                                </p>
                              ) : null}

                              <div className="mt-5 flex flex-wrap gap-3">
                                {publicationUrl ? (
                                  <a
                                    href={publicationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                  >
                                    View publication
                                  </a>
                                ) : null}

                                {publication.doi ? (
                                  <span className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">
                                    DOI: {publication.doi}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {publication.year ? (
                              <div className="shrink-0 text-sm font-semibold text-slate-400">
                                {publication.year}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}