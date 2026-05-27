import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyDetail from "@/components/sections/StudyDetail";
import StudiesHero from "@/components/layout/StudiesHero";
import { getStudyLayoutForSlug } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";
import { getServerLang } from "@/lib/lang";
import { localizedMetadata } from "@/lib/localized-metadata";
import en from "@/messages/en";
import zh from "@/messages/zh";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Ferdinand | HNU Auckland",
      description:
        "A 6-month weight loss nutrition study investigating whether daily feijoa whole fruit powder alters the risk of developing type 2 diabetes.",
    },
    zh: {
      title: "Ferdinand 研究 | HNU Auckland",
      description:
        "一项为期 6 个月的体重管理营养研究，探讨每日食用斐济果全果粉是否会改变 2 型糖尿病风险。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function FerdinandPage() {
  const layout = await getStudyLayoutForSlug("ferdinand");
  if (layout) {
    return <StudyLayoutView study={layout.study} blocks={layout.blocks} />;
  }
  const t = (await getServerLang()) === "ZH" ? zh : en;

  return (
    <>
      <Navbar />

      <StudiesHero
        imageSrc="/ferdinand study.jpg"
        imageAlt={t.studies.ferdinandPageTitle}
        title={t.studies.ferdinandPageTitle}
      />

      <StudyDetail
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
              <li>
                {t.studies.ferdinandQuestion1}
              </li>
              <li>{t.studies.ferdinandQuestion2}</li>
              <li>{t.studies.ferdinandQuestion3}</li>
            </ul>
            <p>
              {t.studies.ferdinandDescriptionText}
            </p>
          </div>
        }
      />

      <Footer />
    </>
  );
}
