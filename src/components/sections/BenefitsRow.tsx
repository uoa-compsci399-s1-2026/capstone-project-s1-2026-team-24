"use client";

import React, { useRef, useState } from "react";

type Benefit = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const ACADEMIC_BENEFITS: Benefit[] = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Knowledge Exchange",
    description: "Access to cutting-edge research and expertise",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Student Training",
    description: "Opportunities for postgraduate research projects",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Joint Publications",
    description: "Co-authored research in leading journals",
  },
];

export const INDUSTRY_BENEFITS: Benefit[] = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Independent Expertise",
    description: "Rigorous, unbiased research you can trust",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Regulatory Compliance",
    description: "Full GCP compliance and ethics approval support",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Commercial Value",
    description: "Evidence-based results that drive product innovation",
  },
];

interface BenefitsRowProps {
  variant: "academic" | "industry" | "both";
  title?: string;
}

function BenefitGrid({ benefits }: { benefits: Benefit[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
      {benefits.map((benefit) => (
        <div key={benefit.title} style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#0c0c48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {benefit.icon}
          </div>
          <h3 style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#0c0c48",
            marginBottom: "8px",
          }}>
            {benefit.title}
          </h3>
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            color: "#4b5563",
            lineHeight: 1.6,
            margin: 0,
          }}>
            {benefit.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function BenefitCarousel({ benefits }: { benefits: Benefit[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollTo(i: number) {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[i] as HTMLElement;
    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setActiveIndex(i);
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "16px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "4px",
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            style={{
              flex: "0 0 75%",
              scrollSnapAlign: "center",
              textAlign: "center",
              backgroundColor: "f0f0f0",
              borderRadius: "20px",
              padding: "28px 20px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#0c0c48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              {benefit.icon}
            </div>
            <h3
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 700,
                color: "#0c0c48",
                marginBottom: "8px",
              }}
            >
              {benefit.title}
            </h3>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#4b5563",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {benefits.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to card ${i + 1}`}
            style={{
              width: i === activeIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: i === activeIndex ? "#0c0c48" : "#d1d5db",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function BenefitsRow({ variant, title }: BenefitsRowProps) {
  return (
    <section style={{ backgroundColor: "#f0f0f0", padding: "60px 0" }}>
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 45px" }}
        className="hidden lg:block"
      >
        {title && (
          <h2 style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "36px",
            fontWeight: 800,
            color: "#0c0c48",
            textAlign: "center",
            marginBottom: "40px",
          }}>
            {title}
          </h2>
        )}
        {variant === "academic" && <BenefitGrid benefits={ACADEMIC_BENEFITS} />}
        {variant === "industry" && <BenefitGrid benefits={INDUSTRY_BENEFITS} />}
        {variant === "both" && (
          <>
            <h2 style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#0c0c48",
              textAlign: "center",
              marginBottom: "32px",
            }}>
              Academic Benefits
            </h2>
            <BenefitGrid benefits={ACADEMIC_BENEFITS} />
            <div style={{ height: "48px" }} />
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#0c0c48",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              Industry Benefits
            </h2>
            <BenefitGrid benefits={INDUSTRY_BENEFITS} />
          </>
        )}
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden px-6">
        {title && (
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "26px",
              fontWeight: 800,
              color: "#0c0c48",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            {title}
          </h2>
        )}
        {variant === "academic" && (
          <BenefitCarousel benefits={ACADEMIC_BENEFITS} />
        )}
        {variant === "industry" && (
          <BenefitCarousel benefits={INDUSTRY_BENEFITS} />
        )}
        {variant === "both" && (
          <>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#0c0c48",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Academic Benefits
            </h2>
            <BenefitCarousel benefits={ACADEMIC_BENEFITS} />
            <div style={{ height: "36px" }} />
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#0c0c48",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Industry Benefits
            </h2>
            <BenefitCarousel benefits={INDUSTRY_BENEFITS} />
          </>
        )}
      </div>
    </section>
  );
}