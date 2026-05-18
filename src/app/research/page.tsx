import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResearchHero from "@/components/sections/ResearchHero";
import ResearchIntroduction from "@/components/sections/ResearchIntroduction";
import ResearchFocus from "@/components/sections/ResearchFocus";
import TrialDesign from "@/components/sections/TrialDesign";
import PostureMaintenanceCallout from "@/components/sections/PostureMaintenanceCallout";
import StudiesArchive from "@/components/sections/StudyIndex";
import StudyIndex from "@/components/sections/StudyIndex";

export const metadata: Metadata = {
  title: "Our Research | HNU",
  description:
    "Better health through nutrition science. Explore our research in diet, disease, and clinical trials.",
};

export default function ResearchPage() {
  return (
    <>
      <Navbar />
      <ResearchHero />
      <main id="main-content">
        <StudyIndex />
      </main>
      <Footer />
    </>
  );
}
