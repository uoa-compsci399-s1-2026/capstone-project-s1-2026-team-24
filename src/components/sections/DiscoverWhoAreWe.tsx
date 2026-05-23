"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function DiscoverWhoAreWe() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0a4479" }}
    >
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-0"
        style={{ left: "44%" }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to right, rgb(10,68,121) 0%, rgba(9,73,126,0.856) 14%, rgba(9,78,130,0.728) 23.4%, rgba(6,104,153,0) 53.3%)",
          }}
        />
        <img
          src="/Discover HNU.jpg"
          alt="HNU building"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[93px] py-14 sm:py-16 lg:py-20 flex flex-col justify-center lg:min-h-[661px]">
        <div className="lg:max-w-[50%]">
          <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-extrabold text-white tracking-[1.04px] leading-tight mb-6 sm:mb-8">
            {t.aboutPage.whoAreWeTitle}
          </h2>

          <div className="space-y-5 text-lg sm:text-xl lg:text-[30px] font-normal text-white leading-relaxed tracking-[0.6px]">
            <p>{t.aboutPage.whoAreWeParagraph1}</p>
            <p>{t.aboutPage.whoAreWeParagraph2}</p>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full h-[260px] sm:h-[360px]">
        <img
          src="/Discover HNU.jpg"
          alt="HNU building"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}