"use client";

import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function AcademicCollaborators() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="flex justify-center items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48] pb-15 text-center">
          {t.collaborations.featuredAcademicTitle}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title={t.collaborations.lactoPharmaTitle}
          description={t.collaborations.lactoPharmaDescription}
          imageSrc="/daniel-quiceno-m-4MQtWCxUrYc-unsplash.jpg"
          imageAlt={t.collaborations.featuredAcademicTitle}
          imagePosition="center"
        />
        <StudyCard
          title={t.collaborations.chitosanTitle}
          description={t.collaborations.chitosanDescription}
          imageSrc="/joachim-schnurle-TLEI9o1HdY4-unsplash.jpg"
          imageAlt={t.collaborations.featuredAcademicTitle}
          imagePosition="center"
        />
      </div>

      <div className="max-w-[1400px] mx-auto h-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title={t.collaborations.omega3Title}
          description={t.collaborations.omega3Description}
          imageSrc="/alex-saks-rCAJjRuTHyE-unsplash.jpg"
          imageAlt={t.collaborations.featuredAcademicTitle}
          imagePosition="center"
        />
        <StudyCard
          title={t.collaborations.adipokynesTitle}
          description={t.collaborations.adipokynesDescription}
          imageSrc="/siora-photography-cixohzDpNIo-unsplash.jpg"
          imageAlt={t.collaborations.featuredAcademicTitle}
          imagePosition="center"
        />
      </div>

      <div className="flex justify-center mt-10">
        <Button href="/collaborations/academic" color="dark">
          {t.collaborations.viewAllAcademicPartners}
        </Button>
      </div>
    </section>
  );
}
