"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

type Props = {
  type: "collaborating" | "industry";
};

export default function PartnerSectionText({ type }: Props) {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <>
      {type === "collaborating"
        ? t.home.collaboratingPartners
        : t.home.currentIndustryPartners}
    </>
  );
}