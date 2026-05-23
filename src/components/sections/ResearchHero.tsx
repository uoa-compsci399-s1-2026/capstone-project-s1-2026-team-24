"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function ResearchHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.research.heroTitle}
      subtitleMaxWidth={626}
      subtitle={
        <>
          {t.research.heroSubtitleLine1}
          <br />
          {t.research.heroSubtitleLine2}
        </>
      }
    />
  );
}