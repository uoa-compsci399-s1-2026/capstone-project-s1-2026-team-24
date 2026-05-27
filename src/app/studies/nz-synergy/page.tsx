import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudiesHero from "@/components/layout/StudiesHero";
import StudyDetail from "@/components/sections/StudyDetail";
import { getStudyLayoutForSlug } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";
import { getServerLang } from "@/lib/lang";
import en from "@/messages/en";
import zh from "@/messages/zh";

export const metadata: Metadata = {
  title: "NZ Synergy | HNU Auckland",
  description:
    "A two-week residential nutrition study investigating dietary effects on diabetes risk markers.",
};

export const dynamic = "force-dynamic";

export default async function NZSynergyPage() {
  const layout = await getStudyLayoutForSlug("nz-synergy");
  if (layout) {
    return <StudyLayoutView study={layout.study} blocks={layout.blocks} />;
  }
  const t = (await getServerLang()) === "ZH" ? zh : en;

  return (
    <>
      <Navbar />

      <StudiesHero
        imageSrc="/NZ Synergy study.jpg"
        imageAlt={t.studies.nzSynergyPageTitle}
        title={t.studies.nzSynergyPageTitle}
        imagePosition="top"
      />

      <StudyDetail
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
              <li>
                {t.studies.nzSynergyQuestion1}
              </li>
              <li>{t.studies.nzSynergyQuestion2}</li>
            </ul>
            <p>
              {t.studies.nzSynergyDescriptionText}
            </p>
          </div>
        }
      />

      <Footer />
    </>
  );
}
