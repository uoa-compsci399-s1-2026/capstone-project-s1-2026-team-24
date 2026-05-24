import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomepageHero from "@/components/sections/HomepageHero";
import HomepageStudies from "@/components/sections/HomepageStudies";
import OurPartners from "@/components/sections/OurPartners";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import BenefitsRow from "@/components/sections/BenefitsRow";
import Updates from "@/components/sections/Updates";

export const metadata: Metadata = {
  title: "Home | Human Nutrition Unit",
  description: "The Human Nutrition Unit Homepage",
};

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomepageHero />
      <Updates
        updates={[
          {
            title: "NZ Synergy Study Now Recruiting",
            date: "May 2026",
            paragraphs: [
              "We are now actively recruiting participants for our NZ Synergy residential nutrition study.",
              "If you are aged 18–60 with elevated fasting blood sugar and a BMI of 24–40, you may be eligible.",
            ],
          },
          {
            title: "New Publication Released",
            date: "April 2026",
            paragraphs: [
              "Our team has published new findings on feijoa whole fruit powder and type 2 diabetes risk markers.",
            ],
          },
        ]}
      />
      <main id="main-content">
        <section className="w-full h-10 bg-white px-16 sm:px-12 lg:px-45 flex items-end justify-center pb-1">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
            Check out our current studies!
          </h2>
        </section>
        <HomepageStudies />
        <InfoCardLeft
          title="About Us"
          imagePosition="right"
          showButton
          paragraphs={[
            "HNU is a nutrition research facility within The University of Auckland, New Zealand's most prestigious and largest University.",
            "The Unit undertakes research to establish links between diet, health and disease prevention.",
          ]}
          buttonLabel="More Information"
          buttonHref="/about"
          imageSrc="/1630363804706 (1).jpg"
          imageAlt="HNU team member standing by blue railings"
        />

        <BenefitsRow variant="academic"></BenefitsRow>

        <InfoCardRight
          title="Our Research"
          imagePosition="left"
          cardBg="light"
          showButton
          paragraphs={[
            "We investigate the effects of whole foods, food components, bioactives and nutraceutical products on health and disease.",
            "Our research focuses on key areas of human nutrition: obesity, appetite regulation, metabolic syndrome, cardiovascular risk, pre-diabetes and type 2 diabetes.",
          ]}
          buttonLabel="Read More →"
          buttonHref="/research"
          imageSrc="/services-and-expertise.jpg"
          imageAlt="HNU research being conducted in the clinical room"
        />
      </main>
      <Footer />
    </>
  );
}
