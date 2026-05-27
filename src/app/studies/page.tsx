import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Our Studies | HNU Auckland",
      description:
        "Take part in advancing nutrition science. Explore our current studies and how to get involved.",
    },
    zh: {
      title: "研究项目 | HNU Auckland",
      description:
        "参与推动营养科学发展。探索当前研究项目以及参与方式。",
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
