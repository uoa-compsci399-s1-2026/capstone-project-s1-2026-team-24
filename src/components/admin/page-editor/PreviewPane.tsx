"use client";

import { useEffect, useRef } from "react";

/**
 * Live-preview iframe for the page editor.
 *
 * The iframe element is stable (its `src` never changes after mount), so it is
 * never remounted by React. When an edit bumps `version` we refresh it in place
 * via `contentWindow.location.reload()` — preserving and restoring the scroll
 * position — and debounce so a burst of edits triggers a single reload. This
 * fixes the old behaviour where keying the iframe on a version counter
 * remounted it on every change and jumped it back to the top.
 */
export default function PreviewPane({
  src,
  version,
}: {
  src: string;
  version: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const firstRun = useRef(true);
  const pendingScroll = useRef<{ x: number; y: number } | null>(null);

  const reload = () => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const win = frame.contentWindow;
      // Same-origin preview, so we can read the scroll offset to restore it.
      pendingScroll.current = win ? { x: win.scrollX, y: win.scrollY } : null;
      if (win) {
        win.location.reload();
        return;
      }
    } catch {
      // Shouldn't happen for a same-origin frame; fall back to a src refresh.
    }
    frame.src = src;
  };

  // Refresh (debounced) when an edit changes `version`; skip the initial mount.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(reload, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  // Restore scroll after a reload completes.
  const handleLoad = () => {
    const target = pendingScroll.current;
    pendingScroll.current = null;
    const win = iframeRef.current?.contentWindow;
    if (!target || !win) return;
    win.scrollTo(target.x, target.y);
    // Run once more after layout settles in case content reflowed.
    requestAnimationFrame(() => win.scrollTo(target.x, target.y));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-500">
          Live preview · {src}
        </p>
        <button
          type="button"
          onClick={reload}
          className="flex-shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-[#0c0c48] hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>
      {/*
        The preview frames our own first-party page, which must hydrate and read
        localStorage (LanguageProvider), so it needs allow-same-origin +
        allow-scripts. The sandbox still withholds the dangerous capabilities —
        top-navigation, forms, popups, modals, downloads, pointer-lock — so a
        hypothetical XSS in public content can't drive the admin shell.
      */}
      <iframe
        ref={iframeRef}
        src={src}
        title="Live preview"
        sandbox="allow-same-origin allow-scripts"
        referrerPolicy="same-origin"
        onLoad={handleLoad}
        className="min-h-0 w-full flex-1 rounded-lg border border-gray-200 bg-white"
      />
      <p className="mt-2 text-center text-[11px] text-gray-400">
        Changes save automatically and refresh the preview.
      </p>
    </div>
  );
}
