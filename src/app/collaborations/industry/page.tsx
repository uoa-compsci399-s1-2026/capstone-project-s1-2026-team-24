import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "@/components/layout/SubpageHero";
import AcademicCollaborators from "@/components/sections/AcademicCollaborators";
import IndustryCollaborators from "@/components/sections/IndustryCollaborators";
import StudyCard from "@/components/ui/StudyCard";

const PARTNER_IMAGES = [
  "/images/partners/1722396919-ocs_art_37_the_great_kiwi_earthworm_survey_agresearch_logo-colour.jpg",
  "/images/partners/dta-logo-uc.jpeg",
  "/images/partners/HPSNZ-Black-Horizontal.jpg",
  "/images/partners/Logo_astar_sifbi-e1619082277983.png",
  "/images/partners/logo_wageningen.png",
  "/images/partners/Nzdf-logo.png",
  "/images/partners/PFR-print.jpg",
  "/images/partners/Riddet_MaoriLogo_Stacked_CMYK_2019-d22aacda.jpeg",
];

export const metadata: Metadata = {
  title: "Industry Partners | HNU Auckland",
  description:
    "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
};

export default function IndustryPartnersPage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <SubpageHero
          title="Industry Partners"
          subtitle="Research collaborations and partnerships with industry and academic units, nationally and internationally."
        />
        <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div
              className="
        grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4
        gap-2 sm:gap-2 items-center
      "
            >
              {PARTNER_IMAGES.map((src, i) => {
                const alt =
                  src
                    .split("/")
                    .pop()
                    ?.replace(/\.[^.]+$/, "")
                    .replace(/[-_]/g, " ")
                    .trim() || `Partner logo ${i + 1}`;

                return (
                  <div
                    key={src}
                    className=" relative w-full aspect-[4/3] rounded-20 border border-gray-200 bg-white p-3 flex items-center justify-center hover:shadow-sm transition-shadow padding-3"
                    title={alt}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                      className="object-contain"
                      priority={i < 8}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
