import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Discover HNU | Human Nutrition Unit",
  description:
    "Focused on better health through nutrition. Learn more about the Human Nutrition Unit — New Zealand's only live-in nutrition trials facility.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("about")}
      <Footer />
    </>
  );
}
