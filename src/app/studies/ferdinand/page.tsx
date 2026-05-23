"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyDetail from "@/components/sections/StudyDetail";
import StudiesHero from "@/components/layout/StudiesHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function FerdinandPage() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

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