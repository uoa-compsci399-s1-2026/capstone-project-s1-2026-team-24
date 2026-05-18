import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomepageHero from "@/components/sections/HomepageHero";
import HomepageStudies from "@/components/sections/HomepageStudies";
import OurPartners from "@/components/sections/OurPartners";
import PostureMaintenanceCallout from "@/components/sections/PostureMaintenanceCallout";
import HomepageAboutUs from "@/components/sections/HomepageAboutUs";
import InfoCard from "@/components/ui/InfoCardLeft";
import Button from "@/components/ui/Button";
import StudyCard from "@/components/ui/StudyCard";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";

export const metadata: Metadata = {
  title: "Home | Human Nutrition Unit",
  description: "The Human Nutrition Unit Homepage",
};

export default function HomePage() {
  return (
    <>
      <style>{`body { background-color: #ffffff; }`}</style>
      <Navbar />
      <HomepageHero />
      <main id="main-content">
        <section className="w-full h-80 bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6">
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
        <InfoCardRight
          title="Posture Maintenance"
          imagePosition="left"
          cardBg="light"
          showButton
          paragraphs={[
            "Maintaining good posture is essential for overall health and well-being.",
            "Our research focuses on the impact of posture on musculoskeletal health and the development of effective interventions.",
          ]}
          buttonLabel="Read More →"
          buttonHref="/posture"
          imageSrc="/photo-1539815208687-a0f05e15d601.avif"
          imageAlt="Person practicing good posture"
        />
        <section className="w-full h-32 bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
            Our partners
          </h2>
        </section>
        <OurPartners />
      </main>
      <Footer />
    </>
  );
}
