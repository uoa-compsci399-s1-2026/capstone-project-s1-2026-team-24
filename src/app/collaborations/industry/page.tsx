import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "@/components/layout/SubpageHero";

const PARTNER_IMAGES = [
  "/images/partners/1722396919-ocs_art_37_the_great_kiwi_earthworm_survey_agresearch_logo-colour.jpg",
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
          subtitleMaxWidth={657}
        />

        <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumbs */}
            <nav className="mb-10 text-[16px] tracking-[0.4px] text-[#0c0c48]">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="mx-2">›</span>
              <Link href="/collaborations" className="hover:underline">
                Collaborations
              </Link>
              <span className="mx-2">›</span>
              <strong>Industry Partners</strong>
            </nav>

            {/* Partner grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    className="relative w-full aspect-[4/3] bg-white flex items-center justify-center"
                    style={{
                      borderRadius: "30px",
                      border: "1px solid #e5e7eb",
                    }}
                    title={alt}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                      className="object-contain p-[10px]"
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
