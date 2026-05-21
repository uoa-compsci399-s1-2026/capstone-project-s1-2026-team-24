import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DiscoverHero from "@/components/sections/DiscoverHero";
import DiscoverVideo from "@/components/sections/DiscoverVideo";
import DiscoverWhoAreWe from "@/components/sections/DiscoverWhoAreWe";
import DiscoverServicesExpertise from "@/components/sections/DiscoverServicesExpertise";
import DiscoverCapabilities from "@/components/sections/DiscoverCapabilities";
import DiscoverFacilities from "@/components/sections/DiscoverFacilities";
import InfoCard from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import CalloutBannerRight from "@/components/ui/CalloutBannerRight";
import CalloutBannerLeft from "@/components/ui/CalloutBannerLeft";
import StudyCard from "@/components/ui/StudyCard";
import Button from "@/components/ui/Button";
import OurPartners from "@/components/sections/OurPartners";
import RecentPublications from "@/components/sections/RecentPublications";

export const metadata: Metadata = {
  title: "Discover HNU | Human Nutrition Unit",
  description:
    "Focused on better health through nutrition. Learn more about the Human Nutrition Unit — New Zealand's only live-in nutrition trials facility.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <DiscoverHero />
      <main id="main-content">
        <DiscoverVideo />

        <CalloutBannerRight
          leftTitle="Collaborate With Us"
          leftDescription="Partner with New Zealand's leading nutrition research facility. We work with academic institutions, industry leaders, and government agencies to advance nutrition science."
          title="Let's work together"
          description="Whether you're looking to fund research, co-develop a study, or explore industry partnerships — we'd love to hear from you."
          buttonLabel="Get in touch →"
          buttonHref="/contact"
          showButton
        />

        <InfoCardLeft
          title="Services & Expertise"
          imagePosition="left"
          cardBg="dark"
          paragraphs={[
            "The Human Nutrition Unit provides a comprehensive range of services across both academic and commercially funded research. These include consultancy on nutrition regulatory issues and health claims, trial design and protocol development, participant recruitment and screening, and full trial management and coordination. The team also delivers data collection, analysis, interpretation, and the publication of peer-reviewed scientific research.",
          ]}
          buttonLabel="Learn More"
          buttonHref="/research"
          imageSrc="/NZ Synergy Study.jpg"
          imageAlt="Healthy food on a table"
        />

        <RecentPublications />

        <InfoCardRight
          title="Capabilities"
          imagePosition="right"
          cardBg="light"
          paragraphs={[
            "The Unit is equipped to deliver highly controlled and precise nutrition research. Capabilities include controlled diet provision, energy expenditure measurement, anthropometric assessments such as body composition analysis, and clinical procedures including phlebotomy and venous cannulation.",
            "Additional services include urine and faecal sample collection, with external nursing support available for overnight studies when required.",
          ]}
          imageSrc="/Our Research.jpg"
          imageAlt="Modern research laboratory"
        />

        <CalloutBannerRight
          leftTitle="Trial Design"
          leftDescription="The Human Nutrition Unit conducts rigorously controlled nutrition intervention trials exploring the relationship between diet, health, and disease outcomes. Studies include randomised, placebo-controlled, single and double-blind designs using both cross-over and parallel methodologies to ensure reliable scientific results. All research follows strict human ethics procedures and Good Clinical Practice (GCP) standards, with approvals from Human Ethics Committees, SCOTT, and MedSafe where required."
          title="Residential & Community Studies"
          description="Research ranges from single-day clinical visits to fully controlled residential studies lasting up to four weeks, where participants follow carefully managed dietary programmes within the Unit’s facilities. Longer-term community trials allow participants to continue daily life while attending scheduled clinic visits for assessments and dietary interventions. These flexible study models provide highly accurate nutritional research while supporting strong participant compliance and scientifically robust outcomes."
        />

        <InfoCardLeft
          title="Facilities"
          imagePosition="left"
          cardBg="dark"
          paragraphs={[
            "HNU offers a purpose-built research environment designed to support controlled human nutrition studies. ",
            "Facilities include a clinical room for blood collection, an indirect calorimetry room for measuring energy expenditure, an interview lounge, and a biological sample handling laboratory. ",
            "The Unit also features a metabolic kitchen and five fully furnished residential bedrooms, along with bathroom facilities, enabling both short- and long-term live-in studies.",
          ]}
          buttonLabel="Explore Our Facilities"
          buttonHref="/facilities"
          imageSrc="/facilities.png"
          imageAlt="Interior of the Human Nutrition Unit facilities"
        />
      </main>

      <CalloutBannerRight
        title="Visit Us"
        description="Visit us or get in touch to learn more about our facilities and research. The Human Nutrition Unit is based at the University of Auckland, and we welcome enquiries from researchers, industry partners, and participants interested in our studies."
        leftDescription=" "
        buttonLabel="Find us and get in contact →"
        buttonHref="/contact"
        showButton
      />

      <Footer />
    </>
  );
}
