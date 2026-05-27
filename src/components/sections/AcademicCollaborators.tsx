import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";
import type { StudyCardContent } from "@/lib/blocks/types";
import { ACADEMIC_COLLABORATORS_DEFAULTS } from "@/lib/blocks/collaborations-content";

// "Featured Academic Collaborations": a heading, four featured cards (in two
// rows of two), and a "view all" button. Editable page-builder block — heading,
// cards and button come from block content (resolved + machine-translated
// server-side). Empty props fall back to the shared defaults so a
// freshly-converted block renders unchanged. A card with no `buttonHref`
// renders as a non-clickable card (the original behaviour).
//
// IMAGE NOTE: each card's `imageSrc` is a resolved path. To swap a card image in
// code and keep it library-managed, set a raw path in the seed/defaults/content
// (NOT in JSX), drop the file in /public, and run `npm run catalog:media`. See
// src/lib/blocks/collaborations-content.ts.

// Group a flat card list into rows of two for the original two-up layout.
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

  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="flex justify-center items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48] pb-15 text-center">
          {heading}
        </h2>
      </div>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>
          {rowIndex > 0 && <div className="max-w-[1400px] mx-auto h-16" />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
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

      {buttonHref ? (
        <div className="flex justify-center mt-10">
          <Button href={buttonHref} color="dark">
            {buttonLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
