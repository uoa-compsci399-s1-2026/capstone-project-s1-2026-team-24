"use client";

import { useEffect, useState, useMemo } from "react";
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
  sourceType: string;
  category: { id: number; name: string } | null;
  authors: Author[];
};

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"] as const;

const STATUS_COLOURS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-[#0c0c48]/10 text-[#0c0c48]/70",
};

export default function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPublications();
  }, []);

  async function fetchPublications() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/publications");
      if (!res.ok) throw new Error("Failed to fetch publications");
      const data = await res.json();
      setPublications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

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
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/publications/sync", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Sync failed (${res.status})`);
      }
      const data = await res.json();
      setSyncMessage(
        `Sync complete. ${data.publicationsUpserted ?? 0} publication(s) upserted across ${data.syncedMembers ?? 0} team member(s).`,
      );
      await fetchPublications();
    } catch (err) {
      setSyncMessage(
        err instanceof Error ? err.message : "Sync failed unexpectedly.",
      );
    } finally {
      setSyncing(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publications.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.journal || "").toLowerCase().includes(q) ||
        p.authorsRaw.toLowerCase().includes(q)
      );
    });
  }, [publications, statusFilter, search]);

  const counts = useMemo(() => {
    const total = publications.length;
    const pending = publications.filter((p) => p.status === "Pending").length;
    const approved = publications.filter((p) => p.status === "Approved").length;
    const rejected = publications.filter((p) => p.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [publications]);

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
            Synced from ORCID for every team member with an ORCID ID. Approve
            what should appear on the public research page, reject the rest.
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

      {syncMessage && (
        <div className="bg-[#0a4479]/5 border border-[#0a4479]/20 text-[#0a4479] px-4 py-3 rounded-2xl mb-6 text-sm">
          {syncMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CountChip label="Total" count={counts.total} />
        <CountChip label="Pending" count={counts.pending} accent="amber" />
        <CountChip
          label="Approved"
          count={counts.approved}
          accent="emerald"
        />
        <CountChip label="Rejected" count={counts.rejected} />
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
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#0a4479]/80">
            {publications.length === 0
              ? "No publications yet. Run the ORCID sync to pull from team-member ORCID profiles."
              : "No publications match the current filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f5f7] text-[#0a4479]/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Year</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a4479]/5">
                {filtered.map((pub) => (
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
                    <td className="px-4 py-3 text-[#0a4479]/80">
                      {pub.category?.name || "—"}
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
        )}
      </section>
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
