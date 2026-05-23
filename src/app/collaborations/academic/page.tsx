import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Academic Partners | HNU Auckland",
  description:
    "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
};

export const dynamic = "force-dynamic";

export default async function AcademicPartnersPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("collaborations-academic")}
      <Footer />
    </>
  );
}
