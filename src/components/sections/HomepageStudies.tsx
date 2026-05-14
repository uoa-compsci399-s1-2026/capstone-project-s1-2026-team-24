import Image from "next/image";
import Link from "next/link";

export default function HomepageStudies() {
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
        marginTop: "0px",
        marginBottom: "0px",
      }}
      aria-label="Homepage studies section"
      className="overflow-visible"
    >
      
      <div className="w-full bg-white px-7 pb-2 pt-50 md:px-12 lg:px-16">
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
        </div>
      </div>
    </section>
  );
}
