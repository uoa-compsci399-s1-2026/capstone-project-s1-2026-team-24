"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function TeamHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.team.heroTitle}
      subtitle={
        <>
          {t.team.heroSubtitleLine1}
          <br />
          {t.team.heroSubtitleLine2}
          <br />
          {t.team.heroSubtitleLine3}
        </>
      }
    />
  );
}