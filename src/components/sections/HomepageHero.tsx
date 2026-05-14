import Image from "next/image";
import Link from "next/link";

export default function HomepageHero() {
  return (
    <section
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "-200px",
        marginBottom: "0px",
      }}
      aria-label="Human Nutrition Unit hero section"
      className="overflow-visible"
    >
      <div
        className="relative min-h-[810px] px-8 pb-24 pt-[315px] md:px-14 md:pb-28 md:pt-[315px] lg:px-24"
        style={{
          background:
            "linear-gradient(112deg, #0f2e75 0%, #0b4e93 48%, #0a95ca 100%)",
        }}
      >
        {/* Hero bowl image */}
        <div className="pointer-events-none absolute -left-75 bottom-[-400px] h-[1000px] w-[1000px]">
          <Image
            src="/Untitled422_20260425205737.png"
            alt="Colourful salad bowl with fresh vegetables"
            fill
            priority
            sizes="900px"
            className="object-contain drop-shadow-2xl"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[350px] max-w-9xl justify-center lg:justify-end">
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
              Unlock the power of food with <br/> the Human Nutrition Unit
            </h2>
            <a
              href="/studies"
              className="mt-15 inline-flex rounded-full border-[5px] border-white/75 px-10 py-3 font-bold tracking-wide text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                fontSize: "28px",
                opacity: 0.75,
              }}
            >
              JOIN A STUDY
            </a>
          </div>
        </div>

        <div className="absolute bottom-5 right-18 z-5 hidden items-end gap-1 md:flex">
          <div className="relative h-[120px] w-[300px]">
            <Image
              src="/1000003090.png"
              alt="Uniservices logo"
              fill
              sizes="500px"
              className="object-contain"
            />
          </div>
          <div
            className="mb-5 h-[75px] w-[3px] bg-white/100"
            aria-hidden="true"
          />
          <div className="relative h-[120px] w-[200px] ml-2">
            <Image
              src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Large.png"
              alt="University of Auckland"
              fill
              sizes="122px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
