"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudiesHero from "@/components/layout/StudiesHero";
import StudyDetail from "@/components/sections/StudyDetail";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function NZSynergyPage() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <>
      <Navbar />

      <StudiesHero
        imageSrc="/NZ Synergy study.jpg"
        imageAlt="NZ Synergy Study"
        title={t.studies.nzSynergyPageTitle}
        imagePosition="top"
      />

      <StudyDetail
        title={t.studies.nzSynergyPageTitle}
        status="Open"
        deadline={t.studies.nzSynergyDeadline}
        eligibility={[
          t.studies.eligibilityAge18To70,
          t.studies.eligibilityBmi18To30,
          t.studies.eligibilityAuckland,
          t.studies.nzSynergyEligibilityStay,
        ]}
        joinHref="/contact"
        contactHref="/contact"
        content={
          <div>
            <ul>
              <li>{t.studies.nzSynergyQuestion1}</li>
              <li>{t.studies.nzSynergyQuestion2}</li>
            </ul>
            <p>{t.studies.nzSynergyDescriptionText}</p>
          </div>
        }
      />

      <Footer />
    </>
  );
}