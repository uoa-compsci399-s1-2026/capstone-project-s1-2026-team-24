import Image from "next/image";
import Link from "next/link";
import PostureMaintenanceCallout from '@/components/sections/PostureMaintenanceCallout';
import OurPartners from '@/components/sections/OurPartners';


export default function AudiencePathway() {
  const studies = [
    {
      title: "NZ Synergy",
      href: "/studies/nz-synergy",
      imageSrc:
        "/674d07898d4f507a734d7b00_Photo for Synergy Study Advertisement_Edited_0-p-2000.jpg",
    },
    {
      title: "NZ Food and Beverage",
      href: "/studies/food-beverage",
      imageSrc: "/food-bev.jpg",
    },
    {
      title: "Ferdinand",
      href: "/studies/ferdinand",
      imageSrc: "/feijoa.jpg",
    },
  ];

  return (
    <section
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "-310px",
        marginBottom: "-65px",
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
            {studies.map((study) => (
              <Link
                key={study.title}
                href={study.href}
                aria-label={`Open the ${study.title} study page`}
                className="block rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a4479]"
              >
                <div className="w-[375px] h-[300px] mx-auto overflow-hidden rounded-[10px]">
                  <img
                    src={study.imageSrc}
                    className="w-full h-full object-cover"
                    alt={study.title}
                  />
                </div>

                <p
                  className="pt-5 text-center text-[#17174f]"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                  }}
                >
                  {study.title}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-22 overflow-hidden rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.12)]">
            <div className="relative h-180 w-full">
              <Image
                src="/1630363804706 (1).jpg"
                alt="HNU team member standing by blue railings"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-top w-full h-full"
              />
              {/* Blue overlay */}
              <div className="absolute inset-0 z-[5] bg-[linear-gradient(to_right,#0A4479_0%,#0A4479_40%,rgba(10,68,121,0)_70%,rgba(10,68,121,0)_100%)]" />

              {/* Text container */}
              <div className="absolute inset-0 z-10 flex items-center pl-[90px] text-white">
                <div className="h-[550px] w-[450px] flex flex-col gap-5">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <PostureMaintenanceCallout />
      <OurPartners />
    </section>
  );
}
