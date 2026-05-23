import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Contact Us | HNU Auckland",
  description:
    "Have a question or enquiry? Get in touch with the Human Nutrition Unit team.",
};

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
