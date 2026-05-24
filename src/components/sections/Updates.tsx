"use client";

import { relative } from "path";
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
  const [isHovered, setIsHovered] = useState(false);

  const prev = () => setCurrent((i) => (i === 0 ? updates.length - 1 : i - 1));

  const next = () => setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrent((i) => (i === updates.length - 1 ? 0 : i + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [updates.length, isHovered]);

  const update = updates[current];

  return (
    <section
      style={{
        backgroundColor: "white",
        padding: "80px 45px",
        height: "500px",
      }}
    >
      <div
        style={{
          maxWidth: "750px",
          marginLeft: "auto",
          marginRight: "140px",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Button */}
        <button
          onClick={prev}
          aria-label="Previous update"
          style={{
            position: "absolute",
            left: "5px",
            top: "45%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255)",
            fontSize: "38px",
            fontWeight: 300,
            cursor: "pointer",
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? "auto" : "none",
            transition: "all 0.3s ease",
            zIndex: 2,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ←
        </button>

        {/* Right Button */}
        <button
          onClick={next}
          aria-label="Next update"
          style={{
            position: "absolute",
            right: "5px",
            top: "45%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255)",
            fontSize: "38px",
            fontWeight: 300,
            cursor: "pointer",
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? "auto" : "none",
            transition: "all 0.3s ease",
            zIndex: 2,
            padding: 0,
            lineHeight: 1,
          }}
        >
          →
        </button>

        <div
          key={current}
          style={{
            backgroundColor: "#0c0c48f2",
            borderRadius: "80px 0 80px 0",
            padding: "50px 50px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            animation: "fadeIn 0.3s ease",
            height: "300px",
            position: "relative",
            overflow: "hidden",
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "24px",
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
