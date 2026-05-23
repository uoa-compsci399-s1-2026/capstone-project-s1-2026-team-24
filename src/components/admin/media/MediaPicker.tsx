"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaAsset = {
  id: number;
  filePath: string;
  originalName: string;
  altText: string;
  caption: string;
  mimeType: string;
  size: number;
};

export default function MediaPicker({
  onSelect,
  label = "Choose from library",
}: {
  onSelect: (filePath: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) setAssets(await res.json());
      else setError("Could not load media library.");
    } catch {
      setError("Could not load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
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
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#0c0c48] hover:bg-gray-100"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-[#0c0c48]">Media library</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-[#0c0c48] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#16166a] disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload new"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>

            {error && (
              <div className="border-b border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : assets.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No images yet. Upload one to get started.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelect(asset.filePath);
                        setOpen(false);
                      }}
                      className="group overflow-hidden rounded-lg border border-gray-200 text-left hover:border-[#0c0c48]"
                      title={asset.originalName}
                    >
                      <div className="flex h-24 items-center justify-center bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.filePath}
                          alt={asset.altText}
                          className="max-h-24 max-w-full object-contain"
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
          </div>
        </div>
      )}
    </>
  );
}
