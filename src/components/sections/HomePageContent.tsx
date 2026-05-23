"use client";

import HomepageStudies from "@/components/sections/HomepageStudies";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function HomePageContent() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <main id="main-content">
      <section className="w-full h-80 bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
          {t.home.currentStudiesTitle}
        </h2>
      </section>

      <HomepageStudies />

      <InfoCardLeft
        title={t.home.aboutTitle}
        imagePosition="right"
        showButton
        paragraphs={[t.home.aboutText, t.home.aboutText2]}
        buttonLabel={t.home.moreInformation}
        buttonHref="/about"
        imageSrc="/1630363804706 (1).jpg"
        imageAlt="HNU team member standing by blue railings"
      />

      <InfoCardRight
        title={t.home.researchTitle}
        imagePosition="left"
        cardBg="light"
        showButton
        paragraphs={[t.home.researchText, t.home.researchText2]}
        buttonLabel={t.home.readMore}
        buttonHref="/research"
        imageSrc="/services-and-expertise.jpg"
        imageAlt="HNU research being conducted in the clinical room"
      />

      <section className="w-full h-32 bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
          {t.home.partnersTitle}
        </h2>
      </section>
    </main>
  );
}