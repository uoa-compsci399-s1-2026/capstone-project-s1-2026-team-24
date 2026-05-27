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

  const prev = () => setCurrent((i) => (i === 0 ? updates.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [updates.length]);

  const update = updates[current];

  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className=" w-full bg-white py-16 overflow-visible"
      data-testid="updates-carousel"
    >
      {/* 1400px container, card sits on the right */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 flex justify-end">
        <div
          className="w-full max-w-[750px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card */}
          <div
            key={current}
            style={{
              backgroundColor: "#0c0c48f2",
              borderRadius: "80px 0 80px 0",
              padding: "50px 80px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              animation: "fadeIn 0.3s ease",
              minHeight: "300px",
              position: "relative",
              overflow: "visible",
            }}
          >
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              ←
            </button>

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
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
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

          {/* Dots + arrows row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginTop: "24px",
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
      `}</style>
    </section>
  );
}
