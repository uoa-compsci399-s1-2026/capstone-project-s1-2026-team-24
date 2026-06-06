import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/studies",
    title: { en: "Our Studies", zh: "研究项目" },
    description: {
      en: "Take part in advancing nutrition science. Explore our current studies and how to get involved.",
      zh: "参与推动营养科学发展。探索当前研究项目以及参与方式。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function StudiesPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("studies")}
      <Footer />
    </>
  );
}
