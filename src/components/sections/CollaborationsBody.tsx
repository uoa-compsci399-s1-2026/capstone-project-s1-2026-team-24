"use client";

import AcademicCollaborators from "./AcademicCollaborators";
import IndustryCollaborators from "./IndustryCollaborators";
import BenefitsRow from "./BenefitsRow";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function CollaborationsBody() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <main className="bg-white">
      <section className="relative w-full py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
        <div className="mx-auto max-w-[1412px]">
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0c0c48] tracking-[1.28px] leading-tight mb-8">
              {t.collaborations.workingTogetherTitle}
            </h2>

            <p className="text-[#0a4479] text-base sm:text-xl lg:text-[28px] leading-relaxed tracking-[0.56px]">
              {t.collaborations.workingTogetherText}
            </p>
          </div>
        </div>
      </section>

      <BenefitsRow />

      <AcademicCollaborators />

      <IndustryCollaborators />
    </main>
  );
}