"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function DiscoverCapabilities() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  return (
    <section className="relative overflow-hidden bg-[#eee]">
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-0"
        style={{ left: "25%" }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to right, rgb(238,238,238) 35.3%, rgba(238,238,238,0.94) 39.9%, rgba(238,238,238,0.80) 42.2%, rgba(238,238,238,0.70) 44.7%, rgba(238,238,238,0.46) 46.9%, rgba(238,238,238,0) 55.1%)",
          }}
        />
        <img
          src="/Our Research.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[93px] py-14 sm:py-16 lg:py-20 flex flex-col justify-center lg:min-h-[755px]">
        <div className="lg:max-w-[45%]">
          <h3 className="text-2xl sm:text-3xl lg:text-[48px] font-bold text-[#0a4479] leading-tight tracking-[0.96px] mb-4 sm:mb-6">
            {t.aboutPage.servicesExpertiseTitle}
          </h3>

          <p className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-relaxed tracking-[0.6px] mb-6 sm:mb-8">
            {t.aboutPage.servicesExpertiseText}
          </p>

          <a
            href="/research"
            className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] underline tracking-[0.6px] hover:opacity-70 transition-opacity"
          >
            {t.aboutPage.readMore}
          </a>
        </div>
      </div>

      <div className="lg:hidden w-full h-[260px] sm:h-[360px]">
        <img
          src="/Our Research.jpg"
          alt="Research capabilities"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}