import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudiesHero from "@/components/layout/StudiesHero";
import StudyDetail from "@/components/sections/StudyDetail";

export const metadata: Metadata = {
  title: "NZ Synergy | HNU Auckland",
  description:
    "A two-week residential nutrition study investigating dietary effects on diabetes risk markers.",
};

const NAVBAR_HEIGHT = 180;

export default function NZSynergyPage() {
  return (
    <>
      <Navbar />

      <StudiesHero
        imageSrc="/NZ Synergy study.jpg"
        imageAlt="NZ Synergy Study"
        title="NZ Synergy Study"
        imagePosition="top"
      />

      <StudyDetail
        title="NZ Synergy Study"
        status="Open"
        deadline="31 December 2024"
        eligibility={[
          "Are between 18-70 years",
          "Have a BMI between 18.5 and 30 kg/m²",
          "Located in Tāmaki Makaurau (Auckland area)",
          "Happy to stay at the Human Nutrition Unit for 2 weeks",
        ]}
        joinHref="/contact"
        contactHref="/contact"
        content={
          <div>
            <ul>
              <li>
                Would you like to participate in a residential nutrition study?
              </li>
              <li>Would you like to learn about how diet affects diabetes risk?</li>
            </ul>
            <p>
              We will investigate how different diets affect markers of diabetes risk.
            </p>
          </div>
        }
      />

      <Footer />
    </>
  );
}
