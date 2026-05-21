import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "@/components/layout/SubpageHero";

const PARTNER_IMAGES = [
  "/images/partners/Logo_MU_Sofia.png",
  "/images/partners/logo_UCA_Long_300dpi.png",
  "/images/partners/Maastricht-University.png",
  "/images/partners/Massey-ui-logo-profile.jpg",
  "/images/partners/newcastle_university_logo.png.webp",
  "/images/partners/the-university-of-nottingham-1-logo-png-transparent.png",
  "/images/partners/the-university-of-sydney-vector-logo.png",
  "/images/partners/uni-of-lisbon-logo.x96648cc0.png",
  "/images/partners/UNIVERSIDAD DE NAVARRA.jpg",
  "/images/partners/university-of-copenhagen.png",
  "/images/partners/university-of-otago-logo-profile.jpg",
  "/images/partners/UUPK9a0CDH8lm8lC8asT7SJsUF23FSkGxVNY94uP.png",
];

export const metadata: Metadata = {
  title: "Academic Partners | HNU Auckland",
  description:
    "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
};

export default function AcademicPartnersPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <SubpageHero
          title="Academic Partners"
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
              <strong>Academic Partners</strong>
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
                      padding: "10px",
                    }}
                    title={alt}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                      className="object-contain p-3"
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
