"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function StudiesHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.studies.heroTitle}
      subtitleMaxWidth={760}
      subtitle={
        <>
          {t.studies.heroSubtitleLine1}
          <br />
          {t.studies.heroSubtitleLine2}
        </>
      }
    />
  );
}