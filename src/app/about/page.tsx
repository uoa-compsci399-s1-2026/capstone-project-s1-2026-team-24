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
import CalloutBanner from "@/components/ui/CalloutBanner";
import StudyCard from "@/components/ui/StudyCard";
import Button from "@/components/ui/Button";
import OurPartners from "@/components/sections/OurPartners";

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

        <CalloutBanner
          tag="Tūhuratia | Discover"
          title="Want to collaborate with us?"
          description="Whether academic or industry, we'd love to explore how we can work together to advance nutrition science."
          buttonLabel="Read More →"
          buttonHref="/collaborations"
          backgroundImage="/images/partners/360_F_1441177330_DVwBGXbUqAfpiwWtTcGqPgZDuIVSPgg3.jpg"
        />

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

        <section className="relative w-full bg-[#f0f0f0] py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48] justify-center text-center mb-10">
            Here are some of our previous research
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
            <StudyCard
              title="LactoPharma consortium"
              description="Dairy bioactives and health"
              imageSrc="/daniel-quiceno-m-4MQtWCxUrYc-unsplash.jpg"
              imageAlt="Academic Collaborators"
              imagePosition="center"
            />
            <StudyCard
              title="Marine polysaccharide Chitosan and weight loss"
              description="Collaboration with the University of Queensland, Australia"
              imageSrc="/joachim-schnurle-TLEI9o1HdY4-unsplash.jpg"
              imageAlt="Academic Collaborators"
              imagePosition="center"
            />
          </div>

          <div className="flex justify-center mt-10">
            <Button href="/collaborations/academic" color="dark">
              View all publications
            </Button>
          </div>
        </section>

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

        <CalloutBanner
          title="Funding & Partnerships"
          description="Interested in supporting nutrition research or collaborating with the Human Nutrition Unit? Explore our funding partners, learn more about current research opportunities, or get in touch to discuss how you can help support future studies and innovation."
          buttonLabel="Our funding partners →"
          buttonHref="/funding"
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

      <CalloutBanner
        title="Visit Us"
        description="Visit us or get in touch to learn more about our facilities and research. The Human Nutrition Unit is based at the University of Auckland, and we welcome enquiries from researchers, industry partners, and participants interested in our studies."
        buttonLabel="Find us and get in contact →"
        buttonHref="/contact"
      />

      <section className="w-full h-32 bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
          Our partners
        </h2>
      </section>
      <OurPartners />

      <Footer />
    </>
  );
}
