"use client";

import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function IndustryCollaborators() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="flex justify-center items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48] pb-15 text-center">
          {t.collaborations.featuredIndustryTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title={t.collaborations.pharmaceuticalTitle}
          description={t.collaborations.pharmaceuticalDescription}
          imageSrc="/roberto-sorin-RS0-h_pyByk-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />

        <StudyCard
          title={t.collaborations.foodTitle}
          description={t.collaborations.foodDescription}
          imageSrc="/lily-banse--YHSwy6uqvk-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="max-w-[1400px] mx-auto h-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title={t.collaborations.foodIngredientsTitle}
          description={t.collaborations.foodIngredientsDescription}
          imageSrc="/dan-gold-4_jhDO54BYg-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />

        <StudyCard
          title={t.collaborations.nutraceuticalsTitle}
          description={t.collaborations.nutraceuticalsDescription}
          imageSrc="/towfiqu-barbhuiya-4N0dLUmdLAY-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="flex justify-center mt-10">
        <Button href="/collaborations/industry" color="dark">
          {t.collaborations.viewAllIndustryPartners}
        </Button>
      </div>
    </section>
  );
}