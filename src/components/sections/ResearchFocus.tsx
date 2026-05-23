"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function ResearchFocus() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const focusAreas = [
    t.research.focusAreaObesity,
    t.research.focusAreaAppetite,
    t.research.focusAreaMetabolicDisorders,
    t.research.focusAreaCardiovascularRisk,
    t.research.focusAreaPrediabetes,
    t.research.focusAreaMetabolismNutrition,
    t.research.focusAreaBodyComposition,
  ];

  const foodComponents = [
    t.research.foodComponentLipids,
    t.research.foodComponentProteins,
    t.research.foodComponentCarbohydrates,
    t.research.foodComponentFlavonoids,
  ];

  return (
    <section className="bg-white py-10 sm:py-14 lg:py-20 relative z-10">
      <div className="max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[93px]">
        <div className="flex flex-col lg:flex-row gap-10 sm:gap-14 lg:gap-20 relative">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl lg:text-[36px] font-bold text-[#0a4479] mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-[0.72px]">
              {t.research.focusTitle}
            </h3>

            <ul className="list-disc list-outside ml-5 sm:ml-7 lg:ml-8 space-y-1 sm:space-y-2">
              {focusAreas.map((item) => (
                <li
                  key={item}
                  className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-7 sm:leading-9 lg:leading-[50px] tracking-[0.72px]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[3px] bg-[#0a4479]/20 -translate-x-1/2"
            aria-hidden="true"
          />

          <div
            className="block lg:hidden w-full h-[2px] bg-[#0a4479]/20"
            aria-hidden="true"
          />

          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl lg:text-[36px] font-bold text-[#0a4479] mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-[0.72px]">
              {t.research.foodComponentsTitle}
            </h3>

            <ul className="list-disc list-outside ml-5 sm:ml-7 lg:ml-8 space-y-1 sm:space-y-2">
              {foodComponents.map((item) => (
                <li
                  key={item}
                  className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-7 sm:leading-9 lg:leading-[50px] tracking-[0.72px]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 sm:mt-16 lg:mt-24 text-center text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-7 sm:leading-9 lg:leading-[50px] tracking-[0.6px] max-w-[1238px] mx-auto">
          {t.research.participantsText}
        </p>
      </div>
    </section>
  );
}