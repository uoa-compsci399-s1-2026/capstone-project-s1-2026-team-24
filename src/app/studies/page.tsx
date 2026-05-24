import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Our Studies | HNU Auckland",
  description:
    "Take part in advancing nutrition science. Explore our current studies and how to get involved.",
};

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
