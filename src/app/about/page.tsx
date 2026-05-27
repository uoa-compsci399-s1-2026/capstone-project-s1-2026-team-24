import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Discover HNU | Human Nutrition Unit",
      description:
        "Focused on better health through nutrition. Learn more about the Human Nutrition Unit — New Zealand's only live-in nutrition trials facility.",
    },
    zh: {
      title: "了解 HNU | Human Nutrition Unit",
      description:
        "专注于通过营养促进更好的健康。了解 Human Nutrition Unit 及其住院式营养试验设施。",
    },
  });
}

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
