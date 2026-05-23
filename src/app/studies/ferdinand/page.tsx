"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyDetail from "@/components/sections/StudyDetail";
import StudiesHero from "@/components/layout/StudiesHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";
import { getStudyLayoutForSlug } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";

export default function FerdinandPage() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

export const metadata: Metadata = {
  title: "Ferdinand | HNU Auckland",
  description:
    "A 6-month weight loss nutrition study investigating whether daily feijoa whole fruit powder alters the risk of developing type 2 diabetes.",
};

export const dynamic = "force-dynamic";

// Full navbar height (utility bar 40px + main nav 140px)
const NAVBAR_HEIGHT = 180;

export default async function FerdinandPage() {
  const layout = await getStudyLayoutForSlug("ferdinand");
  if (layout) {
    return <StudyLayoutView study={layout.study} blocks={layout.blocks} />;
  }

  return (
    <>
      <Navbar />

      <StudiesHero
        imageSrc="/ferdinand study.jpg"
        imageAlt="Ferdinand Study"
        title={t.studies.ferdinandPageTitle}
      />

      <StudyDetail
        title={t.studies.ferdinandPageTitle}
        status="Open"
        deadline={t.studies.ferdinandDeadline}
        eligibility={[
          t.studies.ferdinandEligibilityGlucose,
          t.studies.eligibilityAge18To70,
          t.studies.ferdinandEligibilityWeight,
          t.studies.eligibilityAuckland,
          t.studies.ferdinandEligibilityVisits,
        ]}
        joinHref="/contact"
        contactHref="/contact"
        content={
          <div>
            <ul>
              <li>{t.studies.ferdinandQuestion1}</li>
              <li>{t.studies.ferdinandQuestion2}</li>
              <li>{t.studies.ferdinandQuestion3}</li>
            </ul>
            <p>{t.studies.ferdinandDescriptionText}</p>
          </div>
        }
      />

      <Footer />
    </>
  );
}