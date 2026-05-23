"use client";

import { useState } from "react";
import PageEditor from "./PageEditor";
import type { EditorBlock } from "./SortableBlock";

export default function StudyLayoutEditor({
  studyId,
  studySlug,
  studyTitle,
  overrideSlug,
  initialBlocks,
}: {
  studyId: number;
  studySlug: string;
  studyTitle: string;
  overrideSlug: string;
  initialBlocks: EditorBlock[];
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveAsTemplate() {
    if (
      !window.confirm(
        "Apply this layout to every study that doesn't have its own custom layout?",
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/study-layouts/${studySlug}`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      setMessage(
        res.ok
          ? "Saved. This layout now applies to all studies without their own override."
          : body.error ?? "Could not save the template.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetToDefault() {
    if (
      !window.confirm(
        "Reset this study to its default layout? This deletes the custom layout for this study.",
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/study-layouts/${studySlug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setMessage("Could not reset the layout.");
    } finally {
      setBusy(false);
    }
  }

  const headerExtra = (
    <>
      <button
        type="button"
        onClick={saveAsTemplate}
        disabled={busy}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#0c0c48] hover:bg-gray-100 disabled:opacity-60"
      >
        Save as template
      </button>
      <button
        type="button"
        onClick={resetToDefault}
        disabled={busy}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Reset to default
      </button>
    </>
  );

  return (
    <div>
      <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-[#0a4479]">
        Blocks here render this study&apos;s live data. With no blocks, the page
        shows its default layout. &ldquo;Save as template&rdquo; applies this
        arrangement to all studies that don&apos;t have their own.
      </p>
      {message && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#0c0c48]">
          {message}
        </div>
      )}
      <PageEditor
        slug={overrideSlug}
        title={`Layout: ${studyTitle}`}
        initialBlocks={initialBlocks}
        scope="study"
        backHref={`/admin/studies/${studyId}`}
        backLabel="← Back to study"
        viewHref={`/studies/${studySlug}`}
        headerExtra={headerExtra}
      />
    </div>
  );
}
