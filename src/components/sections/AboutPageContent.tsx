"use client";

import CalloutBannerRight from "@/components/ui/CalloutBannerRight";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import RecentPublications from "@/components/sections/RecentPublications";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function AboutPageContent() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <main id="main-content">
      <CalloutBannerRight
        leftTitle={t.aboutPage.collaborateTitle}
        leftDescription={t.aboutPage.collaborateDescription}
        title={t.aboutPage.workTogetherTitle}
        description={t.aboutPage.workTogetherDescription}
        buttonLabel={t.aboutPage.getInTouch}
        buttonHref="/contact"
        showButton
      />

      <InfoCardLeft
        title={t.aboutPage.servicesExpertiseTitle}
        imagePosition="left"
        cardBg="dark"
        paragraphs={[t.aboutPage.servicesExpertiseText]}
        buttonLabel={t.common.learnMore}
        buttonHref="/research"
        imageSrc="/NZ Synergy Study.jpg"
        imageAlt="Healthy food on a table"
      />

      <RecentPublications />

      <InfoCardRight
        title={t.aboutPage.capabilitiesTitle}
        imagePosition="right"
        cardBg="light"
        paragraphs={[
          t.aboutPage.capabilitiesParagraph1,
          t.aboutPage.capabilitiesParagraph2,
        ]}
        imageSrc="/Our Research.jpg"
        imageAlt="Modern research laboratory"
      />

      <CalloutBannerRight
        leftTitle={t.aboutPage.trialDesignTitle}
        leftDescription={t.aboutPage.trialDesignDescription}
        title={t.aboutPage.residentialStudiesTitle}
        description={t.aboutPage.residentialStudiesDescription}
      />

      <InfoCardLeft
        title={t.aboutPage.facilitiesTitle}
        imagePosition="left"
        cardBg="dark"
        paragraphs={[
          t.aboutPage.facilitiesParagraph1,
          t.aboutPage.facilitiesParagraph2,
          t.aboutPage.facilitiesParagraph3,
        ]}
        buttonLabel={t.aboutPage.exploreFacilities}
        buttonHref="/facilities"
        imageSrc="/facilities.png"
        imageAlt="Interior of the Human Nutrition Unit facilities"
      />

      <CalloutBannerRight
        title={t.aboutPage.visitUsTitle}
        description={t.aboutPage.visitUsDescription}
        leftDescription=" "
        buttonLabel={t.aboutPage.findUsContact}
        buttonHref="/contact"
        showButton
      />
    </main>
  );
}