"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { getBlockDefinition } from "@/lib/blocks/registry";
import { serializeBlockContent } from "@/lib/blocks/validate";
import type { BlockScope } from "@/lib/blocks/types";
import { publicPath } from "@/lib/blocks/page-paths";
import SortableBlock, { type EditorBlock } from "./SortableBlock";
import AddBlockButton from "./AddBlockButton";

export default function PageEditor({
  slug,
  title,
  initialBlocks,
  scope = "page",
  backHref = "/admin/pages",
  backLabel = "← All pages",
  viewHref,
  previewHref,
  headerExtra,
}: {
  slug: string;
  title: string;
  initialBlocks: EditorBlock[];
  scope?: "page" | "study";
  backHref?: string;
  backLabel?: string;
  viewHref?: string;
  /** Public URL shown in the in-editor live-preview pane. Omit to hide preview. */
  previewHref?: string;
  headerExtra?: ReactNode;
}) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  // Bumped after each successful change to reload the preview iframe.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = () => setPreviewVersion((v) => v + 1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const apiBase = `/api/admin/pages/${slug}/blocks`;
  const childScope: BlockScope = scope;

  async function persistOrder(next: EditorBlock[]) {
    try {
      const res = await fetch(`${apiBase}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: next.map((b) => b.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
      bumpPreview();
    } catch {
      setError("Failed to save the new order. Reload and try again.");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(next);
    void persistOrder(next);
  }

  async function handleSave(id: number, content: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("save failed");
      const updated = await res.json();
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: updated.content } : b)),
      );
      bumpPreview();
    } catch {
      setError("Failed to save the section.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleVisible(id: number, isVisible: boolean) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isVisible } : b)),
    );
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible }),
      });
      if (!res.ok) throw new Error("toggle failed");
      bumpPreview();
    } catch {
      setError("Failed to change visibility.");
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isVisible: !isVisible } : b)),
      );
    }
  }

  async function handleDelete(id: number) {
    const prev = blocks;
    setBlocks((p) => p.filter((b) => b.id !== id));
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      bumpPreview();
    } catch {
      setError("Failed to delete the section.");
      setBlocks(prev);
    }
  }

  async function handleAdd(type: string, position: number) {
    setError(null);
    const def = getBlockDefinition(type);
    const content = def?.defaultContent ?? {};
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, position }),
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      const newBlock: EditorBlock = {
        id: created.id,
        type: created.type,
        content: created.content ?? serializeBlockContent(content),
        isVisible: created.isVisible ?? true,
      };
      setBlocks((prev) => {
        const next = [...prev];
        next.splice(position, 0, newBlock);
        return next;
      });
      bumpPreview();
    } catch {
      setError("Failed to add the section.");
    }
  }

  async function handleDuplicate(id: number) {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("duplicate failed");
      const created = await res.json();
      const newBlock: EditorBlock = {
        id: created.id,
        type: created.type,
        content: created.content,
        isVisible: created.isVisible ?? true,
      };
      setBlocks((prev) => {
        const at = prev.findIndex((b) => b.id === id);
        const next = [...prev];
        next.splice(at < 0 ? prev.length : at + 1, 0, newBlock);
        return next;
      });
      bumpPreview();
    } catch {
      setError("Failed to duplicate the section.");
    }
  }

  const liveHref = viewHref ?? publicPath(slug);

  const editorPane = (
    <>
      <AddBlockButton scope={scope} onAdd={(type) => handleAdd(type, 0)} />

      <DndContext
        id={`page-editor-${slug}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-2">
            {blocks.map((block, i) => (
              <div key={block.id}>
                <SortableBlock
                  block={block}
                  scope={childScope}
                  saving={savingId === block.id}
                  onSave={handleSave}
                  onToggleVisible={handleToggleVisible}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
                <AddBlockButton
                  compact
                  scope={scope}
                  onAdd={(type) => handleAdd(type, i + 1)}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="mt-6 text-center text-sm text-gray-400">
          This page has no blocks yet. Add one above.
        </p>
      )}
    </>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="text-xs font-medium text-gray-500 hover:text-[#0c0c48]"
          >
            {backLabel}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-[#0c0c48]">{title}</h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {headerExtra}
          {previewHref && (
            <button
              type="button"
              onClick={() => setShowPreview((s) => !s)}
              aria-pressed={showPreview}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                showPreview
                  ? "border-[#0c0c48] bg-[#0c0c48] text-white"
                  : "border-gray-300 text-[#0c0c48] hover:bg-gray-100"
              }`}
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          )}
          <Link
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#0c0c48] hover:bg-gray-100"
          >
            View live page ↗
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {showPreview && previewHref ? (
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 lg:w-[460px] lg:flex-shrink-0">{editorPane}</div>
          <div className="mt-6 min-w-0 lg:mt-0 lg:flex-1 lg:sticky lg:top-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium text-gray-500">
                Live preview · {previewHref}
              </p>
              <button
                type="button"
                onClick={bumpPreview}
                className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-[#0c0c48] hover:bg-gray-100"
              >
                Refresh
              </button>
            </div>
            <iframe
              key={previewVersion}
              src={previewHref}
              title="Live preview"
              className="h-[75vh] w-full rounded-lg border border-gray-200 bg-white"
            />
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Changes save automatically and refresh the preview.
            </p>
          </div>
        </div>
      ) : (
        editorPane
      )}
    </div>
  );
}
