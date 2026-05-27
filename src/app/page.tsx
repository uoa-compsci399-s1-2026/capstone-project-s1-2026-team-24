import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Home | Human Nutrition Unit",
      description: "The Human Nutrition Unit Homepage",
    },
    zh: {
      title: "首页 | Human Nutrition Unit",
      description: "Human Nutrition Unit 首页。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("home")}
      <Footer />
    </>
  );
}
