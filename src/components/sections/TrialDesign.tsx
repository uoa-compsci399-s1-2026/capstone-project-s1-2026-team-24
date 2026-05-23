"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function TrialDesign() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const trialTypes = [
    t.studies.trialRandomised,
    t.studies.trialPlacebo,
    t.studies.trialSingleBlind,
    t.studies.trialDoubleBlind,
    t.studies.trialCrossOver,
    t.studies.trialParallel,
  ];

  return (
    <section className="bg-[#f5f5f5] py-16 lg:py-24 px-4 sm:px-8 lg:px-[93px]">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.18)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <h2 className="text-[#0a4479] text-3xl sm:text-4xl lg:text-[48px] font-bold leading-tight tracking-[0.96px] mb-8">
                {t.studies.trialDesignTitle}
              </h2>

              <div className="space-y-6 text-[#0a4479] text-base sm:text-lg lg:text-[24px] leading-relaxed tracking-[0.48px]">
                <p>{t.studies.trialDesignParagraph1}</p>

                <p>{t.studies.trialDesignParagraph2}</p>

                <p>{t.studies.trialDesignParagraph3}</p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trialTypes.map((type) => (
                  <div
                    key={type}
                    className="border-[2px] border-[#0a4479] rounded-full px-5 py-3 text-center text-[#0a4479] font-semibold text-sm sm:text-base"
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[350px] lg:min-h-full">
              <img
                src="/trial-design.jpg"
                alt="Clinical trial and nutrition research"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-[#0a4479]/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}