import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyHero from "@/components/layout/StudiesHero";
import StudyDetail from "@/components/sections/StudyDetail";

export const metadata: Metadata = {
  title: "NZ Food and Beverage | HNU Auckland",
  description:
    "A short-term study investigating how different foods and beverages affect your metabolic rate, fat burn, blood sugar levels, and appetite.",
};

// Full navbar height (utility bar 40px + main nav 140px)
const NAVBAR_HEIGHT = 180;

export default function NZFoodAndBeveragePage() {
  return (
    <>
      <Navbar />
        <StudyHero
          imageSrc="/food-bev.jpg"
          imageAlt="NZ Food and Beverage Study"
          title="NZ Food and Beverage"
        />

        <StudyDetail
          title="NZ Food and Beverage Study"
          status="Open"
          deadline="31 December 2024"
          eligibility={[
            "Are between 18-70 years",
            "Have a BMI between 18.5 and 30 kg/m²",
            "Located in Tāmaki Makaurau (Auckland area)",
            "Happy to complete 3 visits to the Human Nutrition Unit",
          ]}
          joinHref="/contact"
          contactHref="/contact"
          content={
            <div>
              <ul>
                <li>
                  Would you like to participate in a short-term nutrition study?
                </li>
                <li>Would you like to learn about how different foods affect your body?</li>
              </ul>
              <p>
                We will investigate how different foods and beverages affect your metabolic rate, fat burn, blood sugar levels, and appetite.
              </p>
            </div>
          }
        />    

      <Footer />
    </>
  );
}
