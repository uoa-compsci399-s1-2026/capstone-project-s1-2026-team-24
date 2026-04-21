import React from "react";

type HeroVariant = "primary" | "page";

interface HeroSectionProps {
  heading: string;
  subheading?: string;
  backgroundImage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  variant?: HeroVariant;
}

export default function HeroSection({
  heading,
  subheading,
  backgroundImage,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  variant = "primary",
}: HeroSectionProps) {
  const isPrimary = variant === "primary";

  const sectionStyle: React.CSSProperties = {
    ...(backgroundImage
      ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    // Break out of the parent max-w-7xl container for full-viewport width
    ...(isPrimary
      ? {
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }
      : {}),
  };

  const hasCtaButtons = ctaLabel || secondaryCtaLabel;

  return (
    <section
      style={sectionStyle}
      className={[
        "relative flex items-center bg-[#0c0c48]",
        isPrimary ? "min-h-[80vh]" : "min-h-[28vh]",
      ].join(" ")}
      aria-labelledby="hero-heading"
    >
      {/* Dark overlay when a background image is provided */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-[#0c0c48]/75" aria-hidden="true" />
      )}

      <div className="relative w-full max-w-7xl mx-auto px-4 py-12 text-center text-white">
        <h1
          id="hero-heading"
          className={[
            "font-bold leading-tight",
            isPrimary
              ? "text-4xl sm:text-5xl md:text-6xl mb-4"
              : "text-2xl sm:text-3xl md:text-4xl mb-3",
          ].join(" ")}
        >
          {heading}
        </h1>

        {subheading && (
          <p
            className={[
              "text-[#00caef]",
              isPrimary
                ? "text-lg sm:text-xl md:text-2xl mb-10"
                : "text-base sm:text-lg mb-4",
            ].join(" ")}
          >
            {subheading}
          </p>
        )}

        {hasCtaButtons && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA — industry partners */}
            {ctaLabel && ctaHref && (
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-[#1f2bd4] text-white hover:bg-[#1724b0] focus-visible:outline-[#1f2bd4] px-6 py-3 text-lg"
              >
                {ctaLabel}
              </a>
            )}
            {/* Secondary CTA — study participants */}
            {secondaryCtaLabel && secondaryCtaHref && (
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-[#00caef] text-[#0c0c48] hover:bg-[#00b8d9] focus-visible:outline-[#00caef] px-6 py-3 text-lg"
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
