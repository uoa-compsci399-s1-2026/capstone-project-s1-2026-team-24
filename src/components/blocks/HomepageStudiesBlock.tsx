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
    // `#studies` anchor: the "JOIN A STUDY" hero CTA, the study-page breadcrumbs
    // and site search now scroll here (the old /studies overview route is gone).
    // scroll-mt clears the fixed navbar and shows the heading band just above.
    <section
      id="studies"
      className="relative w-full bg-white py-10 px-6 sm:px-12 lg:px-45 scroll-mt-28"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
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
