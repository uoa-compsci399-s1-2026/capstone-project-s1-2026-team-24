import Image from "next/image";

export default function AudiencePathway() {
  return (
    <section
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "-310px",
      }}
      aria-label="Human Nutrition Unit hero section"
      className="overflow-visible"
    >
      <div
        className="relative min-h-[860px] px-8 pb-24 pt-[315px] md:px-14 md:pb-28 md:pt-[315px] lg:px-24"
        style={{
          background:
            "linear-gradient(112deg, #0f2e75 0%, #0b4e93 48%, #0a95ca 100%)",
        }}
      >
        {/* Hero bowl image */}
        <div className="pointer-events-none absolute -left-75 bottom-[-400px] h-[1000px] w-[1000px]">
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

        <div className="relative z-10 mx-auto flex min-h-[350px] max-w-9xl justify-center lg:justify-end">
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
      <div className="w-full bg-white px-7 pb-24 pt-50 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <h3
            className="text-center text-[#0c4b89]"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "64px",
              fontWeight: 800,
            }}
          >
            Check out these studies
          </h3>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {["NZ Synergy", "NZ Food and Beverage", "Ferdinand"].map(
              (title) => (
                <div
                  key={title}
                  className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                >
                  <div className="h-[250px] rounded-[10px] bg-red-500" />
                  <p
                    className="pt-5 text-center text-[#17174f]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "28px",
                      fontWeight: 700,
                    }}
                  >
                    {title}
                  </p>
                </div>
              ),
            )}
          </div>

          <div className="mt-24 overflow-hidden rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.12)]">
            <div className="grid min-h-[520px] md:grid-cols-[1.2fr_1fr]">
              <div
                className="flex flex-col justify-between px-10 py-10 text-white md:px-14 md:py-14"
                style={{
                  background:
                    "linear-gradient(90deg, #0f4b88 0%, #0d447d 58%, rgba(13,68,125,0.25) 100%)",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "54px",
                      fontWeight: 800,
                    }}
                  >
                    About Us
                  </h3>
                  <p
                    className="mt-8 max-w-[620px] leading-[1.35]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "28px",
                      fontWeight: 400,
                    }}
                  >
                    HNU is a nutrition research facility within The University
                    of Auckland, New Zealand&apos;s most prestigious and largest
                    University.
                  </p>
                  <p
                    className="mt-8 max-w-[620px] leading-[1.35]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "28px",
                      fontWeight: 400,
                    }}
                  >
                    The Unit undertakes research to establish links between
                    diet, health and disease prevention.
                  </p>
                </div>

                <a
                  href="/about"
                  className="mt-10 inline-flex text-white underline underline-offset-4"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "20px",
                    fontWeight: 400,
                  }}
                >
                  Read More &rarr;
                </a>
              </div>

              <div className="relative h-full min-h-[520px]">
                <Image
                  src="/1630363804706 (1).jpg"
                  alt="HNU team member standing by blue railings"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
