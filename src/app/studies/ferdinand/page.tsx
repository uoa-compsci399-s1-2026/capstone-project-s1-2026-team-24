import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyDetail from "@/components/sections/StudyDetail";
import SubpageHero from "@/components/layout/SubpageHero";
import StudiesHero from "@/components/layout/StudiesHero";
import { getStudyLayoutForSlug } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";

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
        title="Ferdinand Study"
      />

      <StudyDetail
        title="Ferdinand Study"
        status="Open"
        deadline="31 December 2025"
        eligibility={[
          "Have elevated blood glucose but are not diabetic",
          "Are between 18-70 years",
          "Are overweight or obese",
          "Located in Tāmaki Makaurau (Auckland area)",
          "Happy to complete 7 visits to the Human Nutrition Unit",
        ]}
        joinHref="/contact"
        contactHref="/contact"
        content={
          <div>
            <ul>
              <li>
                Would you like to participate in a 6-month nutrition study?
              </li>
              <li>Would you like to lose weight?</li>
              <li>Are you concerned about your diabetes risk?</li>
            </ul>
            <p>
              We will investigate whether daily consumption of feijoa whole
              fruit powder alters risk of developing type 2 diabetes.
            </p>
            {/* add more content */}
          </div>
        }
      />

      <Footer />
    </>
  );
}
