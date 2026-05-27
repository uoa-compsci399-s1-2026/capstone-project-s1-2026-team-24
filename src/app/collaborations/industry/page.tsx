import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Industry Partners | HNU Auckland",
      description:
        "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
    },
    zh: {
      title: "行业合作伙伴 | HNU Auckland",
      description:
        "与国内外行业机构开展研究合作与伙伴关系。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function IndustryPartnersPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("collaborations-industry")}
      <Footer />
    </>
  );
}
