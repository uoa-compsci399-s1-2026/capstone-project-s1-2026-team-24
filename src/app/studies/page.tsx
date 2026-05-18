import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudiesHero from "@/components/sections/StudiesHero";
import StudiesOverview from "@/components/sections/StudiesOverview";
import StudiesContactPanel from "@/components/sections/StudiesContactPanel";
import TrialDesign from "@/components/sections/TrialDesign";

export const metadata: Metadata = {
  title: "Our Studies | HNU Auckland",
  description:
    "Take part in advancing nutrition science. Explore our current studies and how to get involved.",
};

export default function StudiesPage() {
  return (
    <>
      <Navbar />
      {/*
        StudiesHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top slides it up behind the transparent navbar,
        while paddingTop keeps the visible content below the logo row.
      */}
      <StudiesHero />
      <main id="main-content">
        <StudiesOverview />

        <TrialDesign />

        <section className="bg-white px-4 sm:px-8 lg:px-[71px] pb-16 lg:pb-24">
          <div className="max-w-[920px] mx-auto">
            <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] px-8 sm:px-12 py-12">
              <h2 className="text-[#0a4479] text-3xl sm:text-[40px] font-bold text-center tracking-[0.8px] mb-10">
                Contact us
              </h2>
              <StudiesContactPanel />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

