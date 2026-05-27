import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyHero from "@/components/layout/StudiesHero";
import StudyDetail from "@/components/sections/StudyDetail";
import { getStudyLayoutForSlug } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";
import { getServerLang } from "@/lib/lang";
import en from "@/messages/en";
import zh from "@/messages/zh";

export const metadata: Metadata = {
  title: "NZ Food and Beverage | HNU Auckland",
  description:
    "A short-term study investigating how different foods and beverages affect your metabolic rate, fat burn, blood sugar levels, and appetite.",
};

export const dynamic = "force-dynamic";

export default async function NZFoodAndBeveragePage() {
  const layout = await getStudyLayoutForSlug("food-beverage");
  if (layout) {
    return <StudyLayoutView study={layout.study} blocks={layout.blocks} />;
  }
  const t = (await getServerLang()) === "ZH" ? zh : en;

  return (
    <>
      <Navbar />
        <StudyHero
          imageSrc="/food-bev.jpg"
          imageAlt={t.studies.foodBeverageStudyTitle}
          title={t.studies.foodBeveragePageTitle}
        />

        <StudyDetail
          status="Open"
          deadline={t.studies.foodBeverageDeadline}
          eligibility={[
            t.studies.eligibilityAge18To70,
            t.studies.eligibilityBmi18To30,
            t.studies.eligibilityAuckland,
            t.studies.foodBeverageEligibilityVisits,
          ]}
          joinHref="/contact"
          contactHref="/contact"
          content={
            <div>
              <ul>
                <li>
                  {t.studies.foodBeverageQuestion1}
                </li>
                <li>{t.studies.foodBeverageQuestion2}</li>
              </ul>
              <p>
                {t.studies.foodBeverageDescriptionText}
              </p>
            </div>
          }
        />    

      <Footer />
    </>
  );
}
