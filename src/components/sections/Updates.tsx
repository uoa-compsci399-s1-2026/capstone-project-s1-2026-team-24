"use client";

import { useState, useEffect } from "react";

interface Update {
  title: string;
  paragraphs: string[];
  date?: string;
}

interface UpdatesProps {
  updates: Update[];
}

export default function Updates({ updates }: UpdatesProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((i) => (i === 0 ? updates.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [updates.length]);

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

  const update = updates[current];

  const [isHovered, setIsHovered] = useState(false);

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
              backgroundColor: "#0c0c48f2",
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
            {/* Prev button — desktop only */}
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
                display: "var(--arrow-display, block)" as any,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              ←
            </button>

            {/* Next button — desktop only */}
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
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              →
            </button>

            {/* Animated content */}
            <div
              key={current}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                animation: `${direction === "left" ? "slideInLeft" : "slideInRight"} 0.3s ease`,
              }}
            >
              {update.date && (
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
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
                {update.date}
              </span>
            )}

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
            </div>
          </div>

          {/* Dots + arrows row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
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
