import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

interface HomepageHeroProps {
  title?: string;
  buttonLabel?: string;
  buttonHref?: string;
  backgroundGradient?: string;
  heroImageSrc?: string;
}

export default function HomepageHero({
  title = "Unlock the power of food with \n the Human Nutrition Unit",
  buttonLabel = "JOIN A STUDY",
  buttonHref = "/contact",
  backgroundGradient = "linear-gradient(112deg, #0f2e75 0%, #0b4e93 50%, #0a95ca 100%)",
  heroImageSrc = "/images/homepage-hero-bowl.webp",
}: HomepageHeroProps = {}) {
  const titleLines = title.split("\n");
  return (
    <section
      style={{
        maxWidth: "100%",
      }}
      aria-label="Human Nutrition Unit hero section"
      className="overflow-visible"
    >
      <div
        className="relative min-h-[810px] md:px-15 md:pt-[280px] lg:px-15"
        style={{
          background: backgroundGradient,
        }}
      >
        {/* Hero bowl image */}
        <div
          className="pointer-events-none absolute bottom-[-400px] h-[1000px] w-[1000px]"
          style={{ left: "max(-400px, calc(50% - 1000px))" }}
        >
          <Image
            src={heroImageSrc}
            alt="Colourful salad bowl with fresh vegetables"
            fill
            priority
            sizes="900px"
            className="object-contain drop-shadow-2xl"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <div
          className="max-w-[1400px] mx-auto"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minHeight: "350px",
          }}
        >
          <div className="max-w-6xl text-center text-white lg:text-right">
            <h2
              className="leading-[1.05]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "72px",
                fontWeight: 800,
                opacity: 0.75,
              }}
            >
              {titleLines.map((line, i) => (
                <Fragment key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </Fragment>
              ))}
            </h2>
            <Link
              href={buttonHref}
              className="mt-15 inline-flex rounded-full border-[5px] border-white px-10 py-3 font-bold tracking-wide text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                fontSize: "28px",
              }}
            >
              {buttonLabel}
            </Link>
          </div>
        </div>

        <div
          className="max-w-[1400px] mx-auto"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "end",
            justifyContent: "flex-end",
            minHeight: "150px",
          }}
        >
          <div className="relative h-[120px] w-[300px] mr-[-20]">
            <Image
              src="/1000003090.png"
              alt="Uniservices logo"
              fill
              sizes="500px"
              className="object-contain"
              style={{ opacity: 0.5 }}
            />
          </div>
          <div
            className="m-5 h-[75px] w-[3px] bg-white/100 mr-[15]"
            aria-hidden="true"
            style={{ opacity: 0.5 }}
          />
          <div className="relative h-[120px] w-[200px]">
            <Image
              src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Large.png"
              alt="University of Auckland"
              fill
              sizes="122px"
              className="object-contain"
              style={{ opacity: 0.5 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
