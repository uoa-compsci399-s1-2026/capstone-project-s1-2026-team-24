import Image from "next/image";

export default function AudiencePathway() {
  return (
    <section
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "calc(-1 * var(--spacing) * 8)",
      }}
      aria-label="Human Nutrition Unit hero section"
      className="overflow-visible"
    >
      <div
        className="relative min-h-[860px] px-8 py-24 md:px-14 md:py-28 lg:px-24"
        style={{
          background:
            "linear-gradient(112deg, #0f2e75 0%, #0b4e93 48%, #0a95ca 100%)",
        }}
      >
        {/* Hero bowl image */}
        <div className="pointer-events-none absolute -left-75 bottom-[-320px] h-[1000px] w-[1000px]">
          <div className="relative h-full w-full">
            <Image
              src="/images/nutrition plate.png"
              alt="Colourful salad bowl with fresh vegetables"
              fill
              priority
              sizes="900px"
              className="object-contain drop-shadow-2xl"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[580px] max-w-9xl items-center justify-center lg:justify-end">
          <div className="max-w-6xl text-center text-white lg:text-right">
            <h2
              className="leading-[1.05]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "76px",
                fontWeight: 800,
                opacity: 0.75,
              }}
            >
              Unlock the power of food with the Human Nutrition Unit
            </h2>
            <a
              href="/studies"
              className="mt-12 inline-flex rounded-full border-[3px] border-white/75 px-10 py-4 text-xl font-semibold tracking-wide text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              JOIN A STUDY
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
