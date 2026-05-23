"use client";

import { useState } from "react";
import { listBlockDefinitions } from "@/lib/blocks/registry";
import type { BlockCategory } from "@/lib/blocks/types";

const CATEGORY_ORDER: BlockCategory[] = [
  "Hero",
  "Heading",
  "Layout",
  "Study",
  "Content",
  "Dynamic",
];

export default function AddBlockButton({
  onAdd,
  compact = false,
  scope = "page",
  label = "+ Add block",
  exclude = [],
}: {
  onAdd: (type: string) => void;
  compact?: boolean;
  scope?: "page" | "study";
  label?: string;
  exclude?: string[];
}) {
  const [open, setOpen] = useState(false);
  const defs = listBlockDefinitions(scope).filter(
    (d) => !exclude.includes(d.type),
  );

  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? "my-1 rounded-full border border-dashed border-gray-300 px-3 py-0.5 text-xs font-medium text-gray-400 hover:border-[#0c0c48] hover:text-[#0c0c48]"
            : "rounded-lg border border-dashed border-gray-400 px-4 py-2 text-sm font-semibold text-[#0c0c48] hover:bg-gray-100"
        }
      >
        {label}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full z-20 mt-1 max-h-80 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            {CATEGORY_ORDER.map((category) => {
              const items = defs.filter((d) => d.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {category}
                  </p>
                  {items.map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => {
                        onAdd(def.type);
                        setOpen(false);
                      }}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-[#0c0c48] hover:bg-gray-100"
                    >
                      {def.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
