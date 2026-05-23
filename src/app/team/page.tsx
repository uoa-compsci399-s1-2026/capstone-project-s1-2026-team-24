import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

export const metadata: Metadata = {
  title: "Our Team | HNU Auckland",
  description:
    "Meet the people behind the Human Nutrition Unit — our board of directors and research team.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  return (
    <>
      <Navbar />
      {await renderPageBlocks("team")}
      <Footer />
    </>
  );
}
