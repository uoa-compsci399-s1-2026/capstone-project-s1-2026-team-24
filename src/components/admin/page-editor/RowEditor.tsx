"use client";

import { useState } from "react";
import { getBlockDefinition } from "@/lib/blocks/registry";
import type { RowChild } from "@/lib/blocks/types";
import { Field } from "./fields";
import AddBlockButton from "./AddBlockButton";

type Columns = [RowChild[], RowChild[]];

function makeChild(type: string): RowChild {
  const def = getBlockDefinition(type);
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, type, content: { ...(def?.defaultContent ?? {}) } };
}

function readColumns(content: Record<string, unknown>): Columns {
  const cols = Array.isArray(content.columns) ? content.columns : [];
  return [
    Array.isArray(cols[0]) ? (cols[0] as RowChild[]) : [],
    Array.isArray(cols[1]) ? (cols[1] as RowChild[]) : [],
  ];
}

function ChildCard({
  child,
  colIndex,
  childIndex,
  columnLength,
  twoColumn,
  editing,
  onToggleEdit,
  onMove,
  onSwitchColumn,
  onRemove,
  onContentChange,
}: {
  child: RowChild;
  colIndex: 0 | 1;
  childIndex: number;
  columnLength: number;
  twoColumn: boolean;
  editing: boolean;
  onToggleEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  onSwitchColumn: () => void;
  onRemove: () => void;
  onContentChange: (content: Record<string, unknown>) => void;
}) {
  const def = getBlockDefinition(child.type);
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0c0c48]">
          {def?.label ?? child.type}
        </span>
        <div className="flex flex-shrink-0 items-center gap-0.5 text-xs">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={childIndex === 0}
            className="rounded px-1.5 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={childIndex === columnLength - 1}
            className="rounded px-1.5 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          {twoColumn && (
            <button
              type="button"
              onClick={onSwitchColumn}
              className="rounded px-1.5 py-1 text-gray-500 hover:bg-gray-100"
              aria-label="Move to other column"
            >
              {colIndex === 0 ? "→" : "←"}
            </button>
          )}
          {def?.editable && (def.fields?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={onToggleEdit}
              className="rounded px-2 py-1 font-medium text-[#0c0c48] hover:bg-gray-100"
            >
              {editing ? "Close" : "Edit"}
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      </div>
      {editing && def?.editable && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-3 py-3">
          {def.fields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={child.content[field.key]}
              onChange={(v) => onContentChange({ ...child.content, [field.key]: v })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RowEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const variant = content.variant === "oneColumn" ? "oneColumn" : "twoColumn";
  const columns = readColumns(content);
  const [editingId, setEditingId] = useState<string | null>(null);

  const commit = (next: { variant?: string; columns?: Columns }) =>
    onChange({
      variant: next.variant ?? variant,
      columns: next.columns ?? columns,
    });

  const setVariant = (v: "oneColumn" | "twoColumn") => {
    if (v === "oneColumn") {
      // Fold the right column into the left so nothing is lost.
      commit({ variant: v, columns: [[...columns[0], ...columns[1]], []] });
    } else {
      commit({ variant: v, columns });
    }
  };

  const addChild = (colIndex: 0 | 1, type: string) => {
    const next: Columns = [[...columns[0]], [...columns[1]]];
    next[colIndex] = [...next[colIndex], makeChild(type)];
    commit({ columns: next });
  };

  const removeChild = (colIndex: 0 | 1, id: string) => {
    const next: Columns = [[...columns[0]], [...columns[1]]];
    next[colIndex] = next[colIndex].filter((c) => c.id !== id);
    commit({ columns: next });
  };

  const moveChild = (colIndex: 0 | 1, index: number, dir: -1 | 1) => {
    const col = [...columns[colIndex]];
    const target = index + dir;
    if (target < 0 || target >= col.length) return;
    [col[index], col[target]] = [col[target], col[index]];
    const next: Columns = [[...columns[0]], [...columns[1]]];
    next[colIndex] = col;
    commit({ columns: next });
  };

  const switchColumn = (colIndex: 0 | 1, id: string) => {
    const other = (colIndex === 0 ? 1 : 0) as 0 | 1;
    const child = columns[colIndex].find((c) => c.id === id);
    if (!child) return;
    const next: Columns = [[...columns[0]], [...columns[1]]];
    next[colIndex] = next[colIndex].filter((c) => c.id !== id);
    next[other] = [...next[other], child];
    commit({ columns: next });
  };

  const updateChildContent = (
    colIndex: 0 | 1,
    id: string,
    childContent: Record<string, unknown>,
  ) => {
    const next: Columns = [[...columns[0]], [...columns[1]]];
    next[colIndex] = next[colIndex].map((c) =>
      c.id === id ? { ...c, content: childContent } : c,
    );
    commit({ columns: next });
  };

  const renderColumn = (colIndex: 0 | 1, heading: string) => (
    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        {heading}
      </p>
      <div className="space-y-2">
        {columns[colIndex].map((child, i) => (
          <ChildCard
            key={child.id}
            child={child}
            colIndex={colIndex}
            childIndex={i}
            columnLength={columns[colIndex].length}
            twoColumn={variant === "twoColumn"}
            editing={editingId === child.id}
            onToggleEdit={() =>
              setEditingId((cur) => (cur === child.id ? null : child.id))
            }
            onMove={(dir) => moveChild(colIndex, i, dir)}
            onSwitchColumn={() => switchColumn(colIndex, child.id)}
            onRemove={() => removeChild(colIndex, child.id)}
            onContentChange={(c) => updateChildContent(colIndex, child.id, c)}
          />
        ))}
        <AddBlockButton
          compact
          scope="study"
          exclude={["row"]}
          label="+ Add to column"
          onAdd={(type) => addChild(colIndex, type)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Layout
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setVariant("oneColumn")}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              variant === "oneColumn"
                ? "bg-[#0c0c48] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            One column
          </button>
          <button
            type="button"
            onClick={() => setVariant("twoColumn")}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              variant === "twoColumn"
                ? "bg-[#0c0c48] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Two columns
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {renderColumn(0, variant === "twoColumn" ? "Left column" : "Column")}
        {variant === "twoColumn" && renderColumn(1, "Right column")}
      </div>
    </div>
  );
}
