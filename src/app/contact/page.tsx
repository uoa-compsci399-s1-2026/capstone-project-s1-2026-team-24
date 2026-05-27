import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";
import { localizedMetadata } from "@/lib/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    en: {
      title: "Contact Us | HNU Auckland",
      description:
        "Have a question or enquiry? Get in touch with the Human Nutrition Unit team.",
    },
    zh: {
      title: "联系我们 | HNU Auckland",
      description: "有问题或咨询？请与 Human Nutrition Unit 团队联系。",
    },
  });
}

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("contact")}
      <Footer />
    </>
  );
}
