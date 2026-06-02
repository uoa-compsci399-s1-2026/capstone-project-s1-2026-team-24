"use client";

import { useRef, useState, useEffect } from "react";
import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";
import type { StudyCardContent } from "@/lib/blocks/types";
import { ACADEMIC_COLLABORATORS_DEFAULTS } from "@/lib/blocks/collaborations-content";

function toRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

interface AcademicCollaboratorsProps {
  heading?: string;
  cards?: StudyCardContent[];
  buttonLabel?: string;
  buttonHref?: string;
}

export default function AcademicCollaborators({
  heading = ACADEMIC_COLLABORATORS_DEFAULTS.heading,
  cards,
  buttonLabel = ACADEMIC_COLLABORATORS_DEFAULTS.buttonLabel,
  buttonHref = ACADEMIC_COLLABORATORS_DEFAULTS.buttonHref,
}: AcademicCollaboratorsProps) {
  const resolvedCards: StudyCardContent[] =
    cards && cards.length > 0
      ? cards
      : ACADEMIC_COLLABORATORS_DEFAULTS.cards.map((card) => ({ ...card }));
  const rows = toRows(resolvedCards);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / resolvedCards.length;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(index);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [resolvedCards.length]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / resolvedCards.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-white py-16 overflow-hidden">
      <div className="flex justify-center items-center px-6 sm:px-12 lg:px-45">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48] pb-15 text-center">
          {heading}
        </h2>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollPaddingLeft: "24px" }}
        >
          {resolvedCards.map((card, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start"
              style={{ width: "95vw", maxWidth: "400px" }}
            >
              <StudyCard
                title={card.title}
                description={card.description}
                imageSrc={card.imageSrc}
                imageAlt={card.imageAlt}
                imagePosition={card.imagePosition ?? "center"}
                buttonHref={card.buttonHref || undefined}
              />
            </div>
          ))}
          <div className="flex-shrink-0 w-2" />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {resolvedCards.map((_, i) => (
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

      {/* Desktop: original two-column grid layout */}
      <div className="hidden md:block px-6 sm:px-12 lg:px-45">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            {rowIndex > 0 && <div className="max-w-[1400px] mx-auto h-16" />}
            <div className="grid grid-cols-2 gap-8 max-w-[1100px] mx-auto">
              {row.map((card, i) => (
                <StudyCard
                  key={`${rowIndex}-${i}-${card.title}`}
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={card.imageAlt}
                  imagePosition={card.imagePosition ?? "center"}
                  buttonHref={card.buttonHref || undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {buttonHref ? (
        <div className="flex justify-center mt-10 px-6 sm:px-12 lg:px-45">
          <Button href={buttonHref} color="dark">
            {buttonLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}