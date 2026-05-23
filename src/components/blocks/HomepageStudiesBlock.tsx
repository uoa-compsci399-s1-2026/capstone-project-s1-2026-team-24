import StudyCard from "@/components/ui/StudyCard";
import type { StudyCardContent } from "@/lib/blocks/types";

// Editable version of HomepageStudies: renders the same grid markup but driven by
// an editable list of study cards.
export default function HomepageStudiesBlock({
  cards = [],
}: {
  cards?: StudyCardContent[];
}) {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        {cards.map((card, i) => (
          <StudyCard
            key={i}
            title={card.title}
            subtitle={card.subtitle}
            description={card.description}
            buttonLabel={card.buttonLabel}
            buttonHref={card.buttonHref}
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt}
            imagePosition={card.imagePosition}
          />
        ))}
      </div>
    </section>
  );
}
