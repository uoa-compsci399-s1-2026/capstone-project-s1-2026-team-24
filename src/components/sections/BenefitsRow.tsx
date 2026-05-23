"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function BenefitsRow() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const benefits = [
    {
      title: t.collaborations.benefitResearchTitle,
      text: t.collaborations.benefitResearchText,
    },
    {
      title: t.collaborations.benefitExpertiseTitle,
      text: t.collaborations.benefitExpertiseText,
    },
    {
      title: t.collaborations.benefitImpactTitle,
      text: t.collaborations.benefitImpactText,
    },
  ];

  return (
    <section className="bg-[#f5f5f5] py-14 px-6 sm:px-12 lg:px-45">
      <div className="mx-auto max-w-[1412px] grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="rounded-[30px] bg-white p-8 shadow-[0_0_30px_rgba(0,0,0,0.12)]"
          >
            <h3 className="text-[#0c0c48] text-2xl font-extrabold mb-4">
              {benefit.title}
            </h3>

            <p className="text-[#0a4479] text-base leading-relaxed">
              {benefit.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}