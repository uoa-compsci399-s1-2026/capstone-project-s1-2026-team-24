"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function CollaborationsHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.collaborations.heroTitle}
      subtitle={
        <>
          {t.collaborations.heroSubtitleLine1}
          <br />
          {t.collaborations.heroSubtitleLine2}
        </>
      }
    />
  );
}