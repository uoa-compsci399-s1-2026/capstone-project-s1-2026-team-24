import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomepageHero from "@/components/sections/HomepageHero";
import HomePageContent from "@/components/sections/HomePageContent";
import OurPartners from "@/components/sections/OurPartners";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Home | Human Nutrition Unit",
  description: "The Human Nutrition Unit Homepage",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <Navbar />
      <HomepageHero />
      <HomePageContent />
      <OurPartners />
      {await renderPageBlocks("home")}
      <Footer />
    </>
  );
}