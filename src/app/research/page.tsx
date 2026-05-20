import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResearchHero from "@/components/sections/ResearchHero";
import PublicationIndex from "@/components/sections/PublicationIndex";

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
        <PublicationIndex />
      </main>
      <Footer />
    </>
  );
}
