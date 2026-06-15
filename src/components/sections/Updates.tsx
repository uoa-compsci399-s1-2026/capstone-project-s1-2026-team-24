"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Update {
  title: string;
  paragraphs: string[];
  date?: string;
}

interface UpdatesProps {
  updates: Update[];
  /** Any CSS background (colour or gradient). Defaults to the dark navy. */
  backgroundColor?: string;
  /** Accessible name for the carousel — this component renders both the
   *  "updates" and "announcements" blocks, so the caller sets the right label. */
  ariaLabelEn?: string;
  ariaLabelZh?: string;
}

/** Shared layout for each cell in the grid stack (hidden sizing cells + visible card). */
const cellStyle: React.CSSProperties = {
  gridArea: "1 / 1",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

/** One update's content — rendered both as a hidden sizing cell and as the visible card. */
function renderUpdate(update: Update) {
  return (
    <>
      {update.date && (
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {update.date}
        </span>
      )}

      <h3
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "clamp(18px, 4vw, 22px)",
          fontWeight: 700,
          color: "white",
          lineHeight: 1.25,
          margin: 0,
        }}
      >
        {update.title}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {update.paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {para}
          </p>
        ))}
      </div>
    </>
  );
}

export default function Updates({
  updates,
  backgroundColor = "#0c0c48f2",
  ariaLabelEn = "Updates",
  ariaLabelZh = "动态",
}: UpdatesProps) {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isHovered, setIsHovered] = useState(false);
  // True while keyboard focus is within the carousel: reveals the prev/next
  // arrows and pauses autoplay so a keyboard user can read and navigate without
  // the slide rotating under them.
  const [isFocused, setIsFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Modulo wrap so the index self-heals even if `updates` shrinks at
  // runtime and `current` points past the end.
  const prev = () => {
    setDirection("right");
    setCurrent((i) => (i - 1 + updates.length) % updates.length);
  };

  const next = () => {
    setDirection("left");
    setCurrent((i) => (i + 1) % updates.length);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Autoplay pauses on hover, while keyboard focus is within the carousel, and
  // under the OS reduced-motion preference (which fully stops the rotation).
  // Hover and focus give mouse and keyboard users a way to halt the motion
  // (WCAG 2.2.2) without a dedicated pause control.
  const autoplayPaused = isHovered || isFocused || reducedMotion;

  useEffect(() => {
    if (autoplayPaused) return;
    const timer = setInterval(() => {
      setDirection("left");
      setCurrent((i) => (i + 1) % updates.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [updates.length, current, autoplayPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  // Defensive: the block renderer never passes an empty list, but don't
  // crash if it happens — and fall back to the first update if `current`
  // is briefly out of range after the list shrinks.
  const activeUpdate = updates[current] ?? updates[0];
  if (!activeUpdate) return null;

  return (
    <section className="w-full bg-white pt-10 pb-2 px-6 sm:px-12">
      <div className="max-w-[1200px] mx-auto sm:px-12 flex justify-end">
        <div
          className="w-full max-w-[750px]"
          role="group"
          aria-roledescription="carousel"
          aria-label={lang === "EN" ? ariaLabelEn : ariaLabelZh}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
        >
          {/* Card */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              // `background` (not `backgroundColor`) so gradients work too.
              // Text, arrows and dots stay white — light values reduce contrast.
              background: backgroundColor,
              borderRadius: "clamp(40px, 8vw, 80px) 0 clamp(40px, 8vw, 80px) 0",
              padding: "clamp(28px, 5vw, 50px) clamp(24px, 6vw, 80px)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              // The grid stack below already sizes the card to the tallest
              // update, so the card fits its content with no scrollbar. `maxHeight`
              // just caps an unusually long update; only then does overflowY:auto
              // show a scrollbar. (A fixed `height` showed a scrollbar even when
              // the content fit, because the content was a few px taller than the
              // padded box.)
              maxHeight: "380px",
              overflowY: "auto",
              position: "relative",
              overflowX: "hidden",
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            {/* Prev button — kept focusable (pointerEvents always on) and made
                visible on hover OR keyboard focus, with a visible focus ring. */}
            <button
              onClick={prev}
              aria-label={lang === "EN" ? "Previous update" : "上一条"}
              className="updates-arrow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.9)",
                fontSize: "32px",
                fontWeight: 300,
                cursor: "pointer",
                lineHeight: 1,
                opacity: isHovered || isFocused ? 1 : 0,
                // Not clickable while invisible (avoids accidental clicks on an
                // unseen control); keyboard Tab still reaches it, which flips
                // isFocused and makes it visible + interactive.
                pointerEvents: isHovered || isFocused ? "auto" : "none",
                transition: "opacity 0.2s ease",
                zIndex: 2,
              }}
            >
              ←
            </button>

            {/* Next button */}
            <button
              onClick={next}
              aria-label={lang === "EN" ? "Next update" : "下一条"}
              className="updates-arrow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.9)",
                fontSize: "32px",
                fontWeight: 300,
                cursor: "pointer",
                lineHeight: 1,
                opacity: isHovered || isFocused ? 1 : 0,
                // Not clickable while invisible (avoids accidental clicks on an
                // unseen control); keyboard Tab still reaches it, which flips
                // isFocused and makes it visible + interactive.
                pointerEvents: isHovered || isFocused ? "auto" : "none",
                transition: "opacity 0.2s ease",
                zIndex: 2,
              }}
            >
              →
            </button>

            {/* Animated content as a grid stack: every update stays mounted
                as a hidden cell in the same grid area, so the card always
                holds the height of the tallest update and the page never
                reflows (jumps) when the carousel rotates. The active update
                is a visible overlay keyed on `current`, remounted per change
                so the slide-in animation restarts. */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" }}>
              {updates.map((u, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{ ...cellStyle, visibility: "hidden" }}
                >
                  {renderUpdate(u)}
                </div>
              ))}

              <div
                key={`active-${current}`}
                style={{
                  ...cellStyle,
                  animation: `${direction === "left" ? "slideInLeft" : "slideInRight"} 0.3s ease`,
                }}
              >
                {renderUpdate(activeUpdate)}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {updates.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={
                  lang === "EN" ? `Go to update ${i + 1}` : `跳转到第 ${i + 1} 条`
                }
                className="focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c0c48]"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  backgroundColor: i === current ? "#0c0c48" : "#9ca3af",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 640px) {
          /* Hide the arrows on small screens via a stable class (not the now
             localized aria-label); dots + swipe handle touch navigation. */
          .updates-arrow {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
