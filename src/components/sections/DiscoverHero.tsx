"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function DiscoverHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.aboutPage.heroTitle}
      subtitleMaxWidth={697}
      subtitle={
        <>
          {t.aboutPage.heroSubtitleLine1}
          <br />
          {t.aboutPage.heroSubtitleLine2}
        </>
      }
    />
  );
}