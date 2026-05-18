import React from "react";

export default function OurPartners() {
  const PARTNER_IMAGES = [
    "/images/partners/1722396919-ocs_art_37_the_great_kiwi_earthworm_survey_agresearch_logo-colour.jpg",
    "/images/partners/dta-logo-uc.jpeg",
    "/images/partners/HPSNZ-Black-Horizontal.jpg",
    "/images/partners/Logo_astar_sifbi-e1619082277983.png",
    "/images/partners/Logo_MU_Sofia.png",
    "/images/partners/logo_UCA_Long_300dpi.png",
    "/images/partners/logo_wageningen.png",
    "/images/partners/Maastricht-University.png",
    "/images/partners/Massey-ui-logo-profile.jpg",
    "/images/partners/newcastle_university_logo.png.webp",
    "/images/partners/Nzdf-logo.png",
    "/images/partners/PFR-print.jpg",
    "/images/partners/Riddet_MaoriLogo_Stacked_CMYK_2019-d22aacda.jpeg",
    "/images/partners/the-university-of-nottingham-1-logo-png-transparent.png",
    "/images/partners/the-university-of-sydney-vector-logo.png",
    "/images/partners/uni-of-lisbon-logo.x96648cc0.png",
    "/images/partners/UNIVERSIDAD DE NAVARRA.jpg",
    "/images/partners/university-of-copenhagen.png",
    "/images/partners/university-of-otago-logo-profile.jpg",
    "/images/partners/UUPK9a0CDH8lm8lC8asT7SJsUF23FSkGxVNY94uP.png",
  ];

  const partners = PARTNER_IMAGES.map((src, i) => ({
    id: i,
    src,
    alt: `Partner ${i + 1}`,
  }));

  return (
    <section className="bg-white py-14 sm:py-18 lg:py-24">
      {/* Marquee track */}
      <div className="overflow-hidden w-full" aria-label="Our partners">
        <div
          className="marquee-track flex items-center gap-8 sm:gap-12 lg:gap-16"
          aria-hidden="true"
        >
          {/* Duplicate for infinite loop */}
          {[...partners, ...partners].map((partner, idx) => (
            <div
              key={idx}
              className="flex-none w-[160px] sm:w-[200px] lg:w-[240px] h-[100px] sm:h-[120px] lg:h-[140px] bg-white flex items-center justify-center"
            >
              <img
                src={partner.src}
                alt={partner.alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
