"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function ResearchIntroduction() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const categories = [
    t.research.categoryObesity,
    t.research.categoryWeightControl,
    t.research.categoryMetabolicSyndrome,
    t.research.categoryCardiovascularRisk,
  ];

  return (
    <section className="bg-white w-full">
      <div className="relative py-8 sm:py-10 lg:py-12 px-4 sm:px-8 lg:px-[93px] max-w-[1512px] mx-auto">
        <nav className="mb-8 sm:mb-10 lg:mb-12 text-base sm:text-lg lg:text-[20px] tracking-[0.4px] text-[#0c0c48]">
          <Link href="/about" className="hover:underline">
            {t.navbar.about}
          </Link>
          <span className="mx-2 font-normal"> {">"} </span>
          <span className="font-bold">{t.research.heroTitle}</span>
        </nav>

        <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-6 sm:p-10 lg:p-16">
          <h2 className="text-2xl sm:text-4xl lg:text-[48px] font-bold text-[#0a4479] text-center leading-tight tracking-[0.96px] mb-8 sm:mb-12 lg:mb-16">
            {t.research.introTitle}
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 sm:gap-14 lg:gap-20 items-stretch">
            <div className="flex-1 text-lg sm:text-2xl lg:text-[32px] font-normal text-[#0a4479] leading-tight tracking-[0.64px] space-y-5 sm:space-y-8">
              <p>{t.research.introParagraph1}</p>
              <p>{t.research.introParagraph2}</p>
              <p>{t.research.introParagraph3}</p>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4 lg:gap-5">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-center min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex-1 border-[3px] border-[#0a4479] rounded-[66.5px] bg-white text-base sm:text-lg lg:text-[24px] font-bold text-[#0a4479] text-center px-5 sm:px-8 lg:px-10 tracking-[0.48px]"
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}