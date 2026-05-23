import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Our Research | HNU",
  description:
    "Better health through nutrition science. Explore our research in diet, disease, and clinical trials.",
};

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("research")}
      <Footer />
    </>
  );
}
