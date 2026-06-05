"use client";

import { useState, useEffect, useRef } from "react";

interface Update {
  title: string;
  paragraphs: string[];
  date?: string;
}

interface UpdatesProps {
  updates: Update[];
  /** Any CSS background (colour or gradient). Defaults to the dark navy. */
  backgroundColor?: string;
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
            fontFamily: "Inter, sans-serif",
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
          fontFamily: "Inter, sans-serif",
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
              fontFamily: "Inter, sans-serif",
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
}: UpdatesProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isHovered, setIsHovered] = useState(false);
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
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection("left");
      setCurrent((i) => (i + 1) % updates.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [updates.length, current, isHovered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  // Defensive: the block renderer never passes an empty list, but don't
  // crash if it happens — and fall back to the first update if `current`
  // is briefly out of range after the list shrinks.
  const activeUpdate = updates[current] ?? updates[0];
  if (!activeUpdate) return null;

  return (
    <section className="w-full bg-white py-10 px-6 sm:px-12">
      <div className="max-w-[1200px] mx-auto sm:px-12 flex justify-end">
        <div
          className="w-full max-w-[750px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
              minHeight: "260px",
              position: "relative",
              overflow: "hidden",
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            {/* Prev button */}
            <button
              onClick={prev}
              aria-label="Previous update"
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: "32px",
                fontWeight: 300,
                cursor: "pointer",
                lineHeight: 1,
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? "auto" : "none",
                transition: "opacity 0.2s ease",
                zIndex: 2,
              }}
            >
              ←
            </button>

            {/* Next button */}
            <button
              onClick={next}
              aria-label="Next update"
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                fontSize: "32px",
                fontWeight: 300,
                cursor: "pointer",
                lineHeight: 1,
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? "auto" : "none",
                transition: "opacity 0.2s ease",
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
            <div style={{ display: "grid" }}>
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
                aria-label={`Go to update ${i + 1}`}
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  backgroundColor: i === current ? "#0c0c48" : "#d1d5db",
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
          button[aria-label="Previous update"],
          button[aria-label="Next update"] {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
