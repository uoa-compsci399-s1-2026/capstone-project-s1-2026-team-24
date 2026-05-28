"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

type PartnerSectionTitleProps = {
  type: "collaborating" | "industry";
};

export default function PartnerSectionTitle({
  type,
}: PartnerSectionTitleProps) {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c0c48] text-center mb-8 px-6">
      {type === "collaborating"
        ? t.home.collaboratingPartners
        : t.home.currentIndustryPartners}
    </h2>
  );
}