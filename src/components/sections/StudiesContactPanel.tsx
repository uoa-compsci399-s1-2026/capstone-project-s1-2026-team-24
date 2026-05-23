"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function StudiesContactPanel() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <div className="text-center">
      <p className="text-[#0a4479] text-lg sm:text-xl leading-relaxed mb-8">
        {t.studies.contactPanelText}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-[#0a4479] px-8 py-3 text-white font-semibold hover:bg-[#083559] transition-colors"
        >
          {t.studies.contactButton}
        </Link>

        <Link
          href="mailto:hnu@auckland.ac.nz"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#0a4479] px-8 py-3 text-[#0a4479] font-semibold hover:bg-[#0a4479] hover:text-white transition-colors"
        >
          hnu@auckland.ac.nz
        </Link>
      </div>
    </div>
  );
}