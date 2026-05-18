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
        <section className="bg-white py-10 sm:py-12 lg:py-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[64px] font-extrabold text-[#0a4479] text-center tracking-[1.28px] leading-tight">
            What we do
          </h2>
        </section>

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

        <InfoCardRight
          title="Capabilities"
          imagePosition="right"
          cardBg="light"
          paragraphs={[
            "The Unit is equipped to deliver highly controlled and precise nutrition research. Capabilities include controlled diet provision, energy expenditure measurement, anthropometric assessments such as body composition analysis, and clinical procedures including phlebotomy and venous cannulation. Additional services include urine and faecal sample collection, with external nursing support available for overnight studies when required.",
          ]}
          imageSrc="/Our Research.jpg"
          imageAlt="Modern research laboratory"
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
      <Footer />
    </>
  );
}
