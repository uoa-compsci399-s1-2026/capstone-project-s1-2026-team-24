"use client";

import { useState, useEffect, useRef } from "react";

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

  const go = (index: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const prev = () =>
    go(current === 0 ? updates.length - 1 : current - 1, "right");
  const next = () =>
    go(current === updates.length - 1 ? 0 : current + 1, "left");

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => next(), 5000);
    return () => clearInterval(timer);
  }, [updates.length, current, isHovered]);

  const update = updates[current];

  return (
    <section className="w-full bg-white py-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 flex justify-end">
        <div
          className="w-full max-w-[750px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card */}
          <div
            style={{
              backgroundColor: "#0c0c48f2",
              borderRadius: "80px 0 80px 0",
              padding: "50px 80px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: "300px",
              position: "relative",
              overflow: "hidden",
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
                transition: "opacity 0.2s ease",
                zIndex: 2,
              }}
            >
              →
            </button>

            {/* Animated content */}
            <div
              key={current}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                animation: `${direction === "left" ? "slideInLeft" : "slideInRight"} 0.3s ease`,
              }}
            >
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
                  fontSize: "22px",
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
                      fontSize: "15px",
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

          {/* Dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "24px",
            }}
          >
            {updates.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? "left" : "right")}
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
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
