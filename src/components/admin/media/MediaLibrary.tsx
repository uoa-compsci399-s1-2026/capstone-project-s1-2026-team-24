"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaAsset } from "./MediaPicker";

type MediaUsage = {
  pageSlug: string;
  pageTitle: string;
  blockType: string;
  blockId: number;
};

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [usage, setUsage] = useState<MediaUsage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  // Load "where is this used" whenever the selected asset changes.
  useEffect(() => {
    const id = selected?.id;
    if (!id) {
      setUsage([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/media/${id}/usage`)
      .then((r) => (r.ok ? r.json() : { usage: [] }))
      .then((d) => {
        if (!cancelled) setUsage(Array.isArray(d.usage) ? d.usage : []);
      })
      .catch(() => {
        if (!cancelled) setUsage([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) setAssets(await res.json());
      else setError("Could not load media.");
    } catch {
      setError("Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        if (res.ok) {
          const asset = (await res.json()) as MediaAsset;
          setAssets((prev) => [asset, ...prev]);
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Upload failed.");
        }
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function saveMetadata() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: selected.altText,
          caption: selected.caption,
        }),
      });
      if (res.ok) {
        const updated = (await res.json()) as MediaAsset;
        setAssets((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
        setSelected(updated);
      } else {
        setError("Could not save changes.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset(id: number, force = false) {
    if (!force && !window.confirm("Delete this image permanently?")) return;
    const res = await fetch(`/api/admin/media/${id}${force ? "?force=1" : ""}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelected((s) => (s?.id === id ? null : s));
      setError(null);
      return;
    }
    if (res.status === 409) {
      // In use — let the admin confirm a forced delete after the warning.
      const body = await res.json().catch(() => ({}));
      const count = Array.isArray(body.usage) ? body.usage.length : 0;
      if (
        window.confirm(
          `This image is used in ${count} place(s). Deleting it will leave those blocks without an image. Delete anyway?`,
        )
      ) {
        await deleteAsset(id, true);
      }
      return;
    }
    setError("Could not delete image.");
  }

  async function replaceAsset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setReplacing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/media/${selected.id}/replace`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const updated = (await res.json()) as MediaAsset;
        setAssets((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
        setSelected(updated);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Replace failed.");
      }
    } finally {
      setReplacing(false);
      if (replaceInput.current) replaceInput.current.value = "";
    }
  }

  const filtered = assets.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.originalName.toLowerCase().includes(q) ||
      a.altText.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0c0c48]">Media library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage images. Stored images can be reused on any page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-[#0c0c48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16166a] disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or alt text…"
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0c0c48] focus:outline-none"
      />

      <div className="flex gap-6">
        <div className="flex-1">
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400">
              {assets.length === 0
                ? "No images yet. Upload some to get started."
                : "No images match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelected(asset)}
                  className={`overflow-hidden rounded-lg border text-left ${
                    selected?.id === asset.id
                      ? "border-[#0c0c48] ring-2 ring-[#0c0c48]/30"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  title={asset.originalName}
                >
                  <div className="flex h-28 items-center justify-center bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.filePath}
                      alt={asset.altText}
                      className="max-h-28 max-w-full object-contain"
                    />
                  </div>
                  <p className="truncate px-2 py-1 text-[11px] text-gray-500">
                    {asset.originalName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <aside className="w-72 flex-shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.filePath}
                alt={selected.altText}
                className="max-h-40 max-w-full object-contain"
              />
            </div>
            <p className="mb-2 break-all text-xs text-gray-400">
              {selected.filePath}
            </p>
            {selected.width && selected.height ? (
              <p className="mb-3 text-xs text-gray-400">
                {selected.width} × {selected.height} px
              </p>
            ) : null}
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Used in {usage.length} place{usage.length === 1 ? "" : "s"}
              </p>
              {usage.length > 0 && (
                <ul className="mt-1 max-h-24 list-disc overflow-y-auto pl-4 text-xs text-gray-500">
                  {usage.map((u) => (
                    <li
                      key={u.blockId}
                      className="truncate"
                      title={`${u.pageTitle} · ${u.blockType}`}
                    >
                      {u.pageTitle} — {u.blockType}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Alt text
            </label>
            <input
              type="text"
              value={selected.altText}
              onChange={(e) =>
                setSelected({ ...selected, altText: e.target.value })
              }
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0c0c48] focus:outline-none"
            />
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Caption
            </label>
            <textarea
              value={selected.caption}
              onChange={(e) =>
                setSelected({ ...selected, caption: e.target.value })
              }
              rows={2}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0c0c48] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveMetadata}
                disabled={saving}
                className="flex-1 rounded-lg bg-[#0c0c48] px-3 py-2 text-sm font-semibold text-white hover:bg-[#16166a] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => replaceInput.current?.click()}
                disabled={replacing}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#0c0c48] hover:bg-gray-100 disabled:opacity-60"
              >
                {replacing ? "…" : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => deleteAsset(selected.id)}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            <input
              ref={replaceInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={replaceAsset}
              className="hidden"
            />
          </aside>
        )}
      </div>
    </div>
  );
}
