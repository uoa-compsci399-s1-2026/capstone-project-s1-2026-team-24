"use client";

import StudyCard from "@/components/ui/StudyCard";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function HomepageStudies() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <section className="bg-[#EAF2F8] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-5xl font-extrabold text-[#0A4479]">
          {t.home.studiesTitle}
        </h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <StudyCard
            title={t.home.studies.nzSynergyTitle}
            subtitle={t.home.studies.nzSynergySubtitle}
            description={t.home.studies.nzSynergyDescription}
            buttonHref="/studies/nz-synergy"
            buttonLabel={t.home.studies.findOutMore}
            imageSrc="/NZ Synergy Study.jpg"
            imageAlt="NZ Synergy Study"
          />

          <StudyCard
            title={t.home.studies.foodBeverageTitle}
            subtitle={t.home.studies.foodBeverageSubtitle}
            description={t.home.studies.foodBeverageDescription}
            buttonHref="/studies/food-beverage"
            buttonLabel={t.home.studies.findOutMore}
            imageSrc="/NZ Food & Beverage Study.jpg"
            imageAlt="NZ Food and Beverage Study"
          />

          <StudyCard
            title={t.home.studies.ferdinandTitle}
            subtitle={t.home.studies.ferdinandSubtitle}
            description={t.home.studies.ferdinandDescription}
            buttonHref="/studies/ferdinand"
            buttonLabel={t.home.studies.findOutMore}
            imageSrc="/Ferdinand Study.jpg"
            imageAlt="Ferdinand Study"
          />
        </div>
      </div>
    </section>
  );
}