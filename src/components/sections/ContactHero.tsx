"use client";

import SubpageHero from "@/components/layout/SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function ContactHero() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <SubpageHero
      title={t.contactPage.heroTitle}
      subtitle={
        <>
          {t.contactPage.heroSubtitleLine1}
          <br />
          {t.contactPage.heroSubtitleLine2}
        </>
      }
    />
  );
}