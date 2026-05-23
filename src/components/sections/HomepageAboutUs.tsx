"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function HomepageAboutUs() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <section
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "0px",
        marginBottom: "0px",
        paddingTop: "50px",
        paddingBottom: "50px",
        paddingLeft: "50px",
        paddingRight: "50px",
        backgroundColor: "#ffffff",
      }}
      aria-label="Homepage about us section"
      className="overflow-visible"
    >
      <div className="mt-22 overflow-hidden rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.12)]">
        <div className="relative h-180 w-full">
          <Image
            src="/1630363804706 (1).jpg"
            alt="HNU team member standing by blue railings"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-top w-full h-full"
          />

          <div className="absolute inset-0 z-[5] bg-[linear-gradient(to_right,#0A4479_0%,#0A4479_40%,rgba(10,68,121,0)_70%,rgba(10,68,121,0)_100%)]" />

          <div className="absolute inset-0 z-10 flex items-center pl-[90px] text-white">
            <div className="h-[550px] w-[450px] flex flex-col gap-5">
              <h3
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "54px",
                  fontWeight: 800,
                }}
              >
                {t.home.aboutTitle}
              </h3>

              <p
                className="mt-8 max-w-[620px] leading-[1.35]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "28px",
                  fontWeight: 400,
                }}
              >
                {t.home.aboutText}
              </p>

              <p
                className="mt-8 max-w-[620px] leading-[1.35]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "28px",
                  fontWeight: 400,
                }}
              >
                {t.home.aboutText2}
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
                {t.home.readMore}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}