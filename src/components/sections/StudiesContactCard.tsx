"use client";

import StudiesContactPanel from "@/components/sections/StudiesContactPanel";
import { useLanguage } from "@/contexts/LanguageContext";

// The "Contact us" card on the Studies page. Fixed copy, translated via the
// shared dictionary.
export default function StudiesContactCard() {
  const { t } = useLanguage();
  return (
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
  );
}
