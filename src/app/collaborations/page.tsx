import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Collaborations | HNU Auckland",
      description:
        "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
    },
    zh: {
      title: "合作 | HNU Auckland",
      description:
        "与国内外行业机构和学术单位开展研究合作与伙伴关系。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function CollaborationsPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("collaborations")}
      <Footer />
    </>
  );
}
