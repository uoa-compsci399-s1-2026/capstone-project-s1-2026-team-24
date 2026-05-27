"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Author = {
  id: number;
  order: number;
  teamMember: { id: number; name: string };
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
  status: string;
  isVisible: boolean;
  hiddenManually: boolean;
  reviewedManually: boolean;
  matchedKeywords: string;
  matchedAffiliation: string;
  relevanceReason: string;
  sourceType: string;
  category: { id: number; name: string } | null;
  authors: Author[];
};

type Counts = {
  total: number;
  Pending: number;
  Approved: number;
  Rejected: number;
};

type PublicationsResponse = {
  items: Publication[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Counts;
};

type SyncMemberResult = {
  teamMember: string;
  orcidId: string;
  worksFound: number;
  created: number;
  updated: number;
  skippedBeforeYear: number;
  skippedNotAffiliated: number;
  skippedDuplicates: number;
  syncedTitles: string[];
  skippedTitles: string[];
  error?: string;
};

type SyncResponse = {
  syncedMembers: number;
  failedMembers: number;
  worksFound: number;
  created: number;
  updated: number;
  skippedBeforeYear: number;
  skippedNotAffiliated: number;
  skippedDuplicates: number;
  libraryTotal: number;
  results: SyncMemberResult[];
  message?: string;
};

type FilterSettings = {
  minYear: number | "";
  affiliationPhrases: string;
  institutionRors: string;
  strongKeywords: string;
  weakKeywords: string;
  exclusionKeywords: string;
};

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"] as const;

const STATUS_COLOURS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-[#0c0c48]/10 text-[#0c0c48]/70",
};

export default function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input so we don't hit the server on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever the filter or search term changes.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/publications?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch publications");
      const data: PublicationsResponse = await res.json();
      setPublications(Array.isArray(data.items) ? data.items : []);
      setCounts(
        data.counts ?? { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
      );
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  async function quickStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/admin/publications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update publication");
      await fetchPublications();
    } catch (err) {
      console.error(err);
    }
  }

  async function deletePublication(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/publications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete publication");
      await fetchPublications();
    } catch (err) {
      console.error(err);
    }
  }

  async function runOrcidSync() {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    setBreakdownOpen(false);
    try {
      const res = await fetch("/api/admin/publications/sync", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Sync failed (${res.status})`);
      }
      const data: SyncResponse = await res.json();
      setSyncResult(data);
      await fetchPublications();
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Sync failed unexpectedly.",
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[2px] text-[#0a4479]/70">
            Publications
          </p>
          <h1 className="text-4xl font-extrabold text-[#0c0c48] mt-1 tracking-tight">
            Publications
          </h1>
          <p className="text-[#0a4479]/80 mt-2 max-w-2xl">
            Synced from ORCID for every team member with an ORCID ID. Relevance
            is decided by year, affiliation, and keywords (configurable below);
            approve or reject is the final say.
          </p>
        </div>
        <button
          onClick={runOrcidSync}
          disabled={syncing}
          className="inline-flex items-center justify-center bg-[#0a4479] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#083559] transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-fit"
        >
          {syncing ? "Syncing from ORCID..." : "Sync from ORCID"}
        </button>
      </header>

      {syncError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
          {syncError}
        </div>
      )}

      {syncResult && (
        <SyncSummary
          result={syncResult}
          open={breakdownOpen}
          onToggle={() => setBreakdownOpen((v) => !v)}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <FilterSettingsPanel />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CountChip label="Total" count={counts.total} />
        <CountChip label="Pending" count={counts.Pending} accent="amber" />
        <CountChip label="Approved" count={counts.Approved} accent="emerald" />
        <CountChip label="Rejected" count={counts.Rejected} />
      </section>

      <section className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-b border-[#0a4479]/10">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  statusFilter === opt
                    ? "bg-[#0a4479] text-white"
                    : "bg-[#f5f5f7] text-[#0a4479] hover:bg-[#0a4479]/10"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, journal, authors..."
            className="md:w-72 px-4 py-2 border-2 border-[#cac7c7] rounded-full text-sm text-[#0c0c48] placeholder:text-[#8e8d8d] focus:outline-none focus:border-[#0a4479]"
          />
        </header>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-[#0a4479]/20 border-t-[#0a4479] animate-spin" />
          </div>
        ) : publications.length === 0 ? (
          <div className="p-12 text-center text-[#0a4479]/80">
            {counts.total === 0
              ? "No publications yet. Run the ORCID sync to pull from team-member ORCID profiles."
              : "No publications match the current filter."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f5f7] text-[#0a4479]/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 py-3 text-left font-semibold">Year</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Relevance
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a4479]/5">
                  {publications.map((pub) => (
                    <tr key={pub.id} className="hover:bg-[#f5f5f7]">
                      <td className="px-4 py-3 font-semibold text-[#0c0c48] max-w-[340px] break-words">
                        {pub.title}
                        <p className="text-xs font-normal text-[#0a4479]/70 mt-0.5 truncate">
                          {pub.authorsRaw ||
                            pub.authors
                              .map((a) => a.teamMember.name)
                              .join(", ")}
                          {pub.journal ? ` · ${pub.journal}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[#0a4479]/80">
                        {pub.year || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#0a4479]/80 max-w-[220px]">
                        <span className="text-xs">
                          {pub.relevanceReason || "—"}
                        </span>
                        {pub.reviewedManually && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-[#0a4479]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0a4479]">
                            Reviewed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOURS[pub.status] || STATUS_COLOURS.Rejected}`}
                        >
                          {pub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {pub.status !== "Approved" && (
                          <button
                            onClick={() => quickStatus(pub.id, "Approved")}
                            className="text-emerald-700 hover:underline font-semibold mr-3 text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {pub.status !== "Rejected" && (
                          <button
                            onClick={() => quickStatus(pub.id, "Rejected")}
                            className="text-[#0a4479]/70 hover:underline font-semibold mr-3 text-xs"
                          >
                            Reject
                          </button>
                        )}
                        <Link
                          href={`/admin/publications/${pub.id}`}
                          className="text-[#0a4479] hover:underline font-semibold mr-3"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deletePublication(pub.id, pub.title)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#0a4479]/10 text-sm text-[#0a4479]/80">
              <span>
                {total} result{total === 1 ? "" : "s"} · page {page} of{" "}
                {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 rounded-full font-semibold bg-[#f5f5f7] text-[#0a4479] hover:bg-[#0a4479]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-1.5 rounded-full font-semibold bg-[#f5f5f7] text-[#0a4479] hover:bg-[#0a4479]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

function SyncSummary({
  result,
  open,
  onToggle,
}: {
  result: SyncResponse;
  open: boolean;
  onToggle: () => void;
}) {
  if (result.message) {
    return (
      <div className="bg-[#0a4479]/5 border border-[#0a4479]/20 text-[#0a4479] px-4 py-3 rounded-2xl mb-6 text-sm">
        {result.message}
      </div>
    );
  }

  const skipped =
    result.skippedBeforeYear +
    result.skippedNotAffiliated +
    result.skippedDuplicates;

  return (
    <div className="bg-[#0a4479]/5 border border-[#0a4479]/20 text-[#0a4479] px-4 py-3 rounded-2xl mb-6 text-sm">
      <p className="font-semibold">
        Synced {result.syncedMembers} member
        {result.syncedMembers === 1 ? "" : "s"}
        {result.failedMembers > 0
          ? ` (${result.failedMembers} failed)`
          : ""}{" "}
        — {result.created} new, {result.updated} updated, {skipped} skipped (
        {result.skippedBeforeYear} before cutoff,{" "}
        {result.skippedNotAffiliated} not HNU-affiliated,{" "}
        {result.skippedDuplicates} duplicate). Library now {result.libraryTotal}.
      </p>
      {result.results.length > 0 && (
        <button
          onClick={onToggle}
          className="mt-2 text-xs font-semibold underline"
        >
          {open ? "Hide per-member breakdown" : "Show per-member breakdown"}
        </button>
      )}
      {open && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[#0a4479]/70">
              <tr className="text-left">
                <th className="py-1 pr-4 font-semibold">Member</th>
                <th className="py-1 pr-4 font-semibold">Found</th>
                <th className="py-1 pr-4 font-semibold">New</th>
                <th className="py-1 pr-4 font-semibold">Updated</th>
                <th className="py-1 pr-4 font-semibold">Before cutoff</th>
                <th className="py-1 pr-4 font-semibold">Not affiliated</th>
                <th className="py-1 pr-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((r) => (
                <tr
                  key={`${r.teamMember}-${r.orcidId}`}
                  className="border-t border-[#0a4479]/10"
                >
                  <td className="py-1 pr-4">{r.teamMember}</td>
                  <td className="py-1 pr-4">{r.worksFound}</td>
                  <td className="py-1 pr-4">{r.created}</td>
                  <td className="py-1 pr-4">{r.updated}</td>
                  <td className="py-1 pr-4">{r.skippedBeforeYear}</td>
                  <td className="py-1 pr-4">{r.skippedNotAffiliated}</td>
                  <td className="py-1 pr-4 text-red-700">{r.error ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSettingsPanel() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<FilterSettings>({
    minYear: "",
    affiliationPhrases: "",
    institutionRors: "",
    strongKeywords: "",
    weakKeywords: "",
    exclusionKeywords: "",
  });
  const requestedRef = useRef(false);

  // Lazy-load the settings the first time the panel is opened.
  useEffect(() => {
    if (!open || requestedRef.current) return;
    requestedRef.current = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/publications/filter-settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings({
          minYear: typeof data.minYear === "number" ? data.minYear : "",
          affiliationPhrases: data.affiliationPhrases ?? "",
          institutionRors: data.institutionRors ?? "",
          strongKeywords: data.strongKeywords ?? "",
          weakKeywords: data.weakKeywords ?? "",
          exclusionKeywords: data.exclusionKeywords ?? "",
        });
        setLoaded(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
        requestedRef.current = false;
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  async function save() {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/publications/filter-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minYear: settings.minYear === "" ? undefined : settings.minYear,
          affiliationPhrases: settings.affiliationPhrases,
          institutionRors: settings.institutionRors,
          strongKeywords: settings.strongKeywords,
          weakKeywords: settings.weakKeywords,
          exclusionKeywords: settings.exclusionKeywords,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      const data = await res.json();
      setSettings((prev) => ({
        ...prev,
        minYear: typeof data.minYear === "number" ? data.minYear : prev.minYear,
      }));
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="font-semibold text-[#0c0c48]">
            Relevance settings
          </span>
          <span className="block text-xs text-[#0a4479]/70 mt-0.5">
            Year cutoff, unit affiliations, and keywords that decide what the
            ORCID sync keeps. Applies on the next sync.
          </span>
        </span>
        <span className="text-[#0a4479] text-sm font-semibold ml-4 shrink-0">
          {open ? "Hide" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-[#0a4479]/10 pt-4">
          {loading && !loaded ? (
            <div className="py-6 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-[#0a4479]/20 border-t-[#0a4479] animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="max-w-[200px]">
                <SettingLabel htmlFor="minYear">Minimum year</SettingLabel>
                <input
                  id="minYear"
                  type="number"
                  value={settings.minYear}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      minYear: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 border-2 border-[#cac7c7] rounded-xl text-sm text-[#0c0c48] focus:outline-none focus:border-[#0a4479]"
                />
                <p className="text-xs text-[#0a4479]/60 mt-1">
                  Works published before this year are rejected.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingTextarea
                  id="affiliationPhrases"
                  label="Unit affiliation phrasings"
                  helper="One per line. A match in a paper's affiliation = strong signal (auto-approve)."
                  value={settings.affiliationPhrases}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, affiliationPhrases: v }))
                  }
                />
                <SettingTextarea
                  id="institutionRors"
                  label="Institution RORs"
                  helper="One per line (e.g. 03b94tp07 for UoA). Institution-only match is a weak signal."
                  value={settings.institutionRors}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, institutionRors: v }))
                  }
                />
                <SettingTextarea
                  id="strongKeywords"
                  label="Strong keywords"
                  helper="One per line. A single strong keyword (plus affiliation) can approve a work."
                  value={settings.strongKeywords}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, strongKeywords: v }))
                  }
                />
                <SettingTextarea
                  id="weakKeywords"
                  label="Weak keywords"
                  helper="One per line. Only meaningful in combination → sends to Pending."
                  value={settings.weakKeywords}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, weakKeywords: v }))
                  }
                />
                <SettingTextarea
                  id="exclusionKeywords"
                  label="Exclusion keywords"
                  helper="One per line. Off-topic terms that push toward Rejected."
                  value={settings.exclusionKeywords}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, exclusionKeywords: v }))
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center justify-center bg-[#0a4479] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#083559] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save settings"}
                </button>
                {savedAt && (
                  <span className="text-xs text-emerald-700">
                    Saved at {savedAt}. Run a sync to apply.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SettingLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs uppercase tracking-[1px] font-semibold text-[#0a4479]/70 mb-1"
    >
      {children}
    </label>
  );
}

function SettingTextarea({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <SettingLabel htmlFor={id}>{label}</SettingLabel>
      <textarea
        id={id}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border-2 border-[#cac7c7] rounded-xl text-sm text-[#0c0c48] focus:outline-none focus:border-[#0a4479] font-mono"
      />
      <p className="text-xs text-[#0a4479]/60 mt-1">{helper}</p>
    </div>
  );
}

function CountChip({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent?: "amber" | "emerald";
}) {
  const colour =
    accent === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : accent === "emerald"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-white text-[#0a4479] border-[#0a4479]/15";
  return (
    <div
      className={`px-4 py-3 rounded-2xl border ${colour} shadow-[0_8px_24px_rgba(0,0,0,0.04)]`}
    >
      <p className="text-xs uppercase tracking-[1.5px] font-semibold">
        {label}
      </p>
      <p className="text-2xl font-extrabold mt-1">{count}</p>
    </div>
  );
}
