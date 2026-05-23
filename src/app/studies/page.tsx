"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudiesHero from "@/components/layout/StudiesHero";
import StudiesOverview from "@/components/sections/StudiesOverview";
import StudiesContactPanel from "@/components/sections/StudiesContactPanel";
import TrialDesign from "@/components/sections/TrialDesign";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function StudiesPage() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <>
      <Navbar />
      <StudiesHero />

      <main id="main-content">
        <StudiesOverview />

        <TrialDesign />

        <section className="bg-white px-4 sm:px-8 lg:px-[71px] pb-16 lg:pb-24">
          <div className="max-w-[920px] mx-auto">
            <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] px-8 sm:px-12 py-12">
              <h2 className="text-[#0a4479] text-3xl sm:text-[40px] font-bold text-center tracking-[0.8px] mb-10">
                {t.studies.contactUs}
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
