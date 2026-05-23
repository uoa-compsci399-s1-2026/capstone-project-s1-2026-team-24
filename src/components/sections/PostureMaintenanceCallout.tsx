"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function PostureMaintenanceCallout() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const bgColor = "#eeeeee";

  return (
    <section
      className="relative w-full overflow-hidden flex items-stretch"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative z-10 w-full max-w-[1512px] mx-auto flex flex-col lg:flex-row items-stretch">
        <div className="flex-[1.2] py-10 sm:py-14 lg:py-20 px-6 sm:px-12 lg:px-[93px] flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#0a4479] leading-8 sm:leading-10 lg:leading-[50px] tracking-[0.4px] mb-5 sm:mb-6 lg:mb-8">
            {t.research.postureTitle}
          </h2>

          <p className="text-sm sm:text-base lg:text-[20px] font-normal text-[#0a4479] leading-6 sm:leading-7 lg:leading-[35px] mb-8 sm:mb-10 lg:mb-12 max-w-[700px]">
            {t.research.postureDescription}
          </p>

          <div>
            <Link
              href="/research/posture-maintenance"
              className="inline-block bg-white/75 px-6 sm:px-8 lg:px-10 py-3 lg:py-4 rounded-[10px] text-base sm:text-lg lg:text-[24px] font-normal text-[#0c0c48] tracking-[0.48px] hover:bg-white transition-colors"
            >
              {t.research.moreInformation}
            </Link>
          </div>
        </div>

        <div className="flex-1 relative min-h-[250px] sm:min-h-[400px] lg:min-h-[595px]">
          <Image
            src="/spinal-page-clipboard.png"
            alt="Spinal page clipboard"
            fill
            className="object-cover object-right"
            priority
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${bgColor} 0%, ${bgColor} 10%, rgba(238, 238, 238, 0) 50%)`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}