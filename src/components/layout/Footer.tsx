"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function Footer() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const navLinks = [
    { href: "/", label: t.footer.home },
    { href: "/team", label: t.footer.team },
    { href: "/research", label: t.footer.research },
    { href: "/studies", label: t.footer.studies },
    { href: "/contact", label: t.footer.contact },
  ];

  const legalLinks = [
    {
      href: "https://www.auckland.ac.nz",
      label: t.footer.university,
    },
    {
      href: "https://www.auckland.ac.nz/en/about/the-university/accessibility.html",
      label: t.footer.accessibility,
    },
    {
      href: "https://www.uniservices.co.nz",
      label: t.footer.copyrightByUniservices,
    },
    {
      href: "https://www.auckland.ac.nz/en/privacy.html",
      label: t.footer.privacy,
    },
    {
      href: "https://www.auckland.ac.nz/en/about/the-university/disclaimer.html",
      label: t.footer.disclaimer,
    },
  ];

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="flex items-center gap-5">
            <Image
              src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Small.png"
              alt="University of Auckland"
              width={164}
              height={78}
              className="object-contain flex-shrink-0"
            />

            <div className="w-px self-stretch bg-white/40" />

            <Image
              src="/images/logos/hnu-logo.svg"
              alt="HNU Auckland"
              width={173}
              height={58}
              className="object-contain flex-shrink-0"
            />
          </div>

          <div>
            <h3 className="font-bold text-xl mb-1 tracking-wide">
              {t.footer.explore}
            </h3>

            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block leading-[50px] text-white/90 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-white/20">
          <ul className="flex flex-wrap justify-end items-center gap-y-1 text-sm tracking-wide text-white/70">
            {legalLinks.map((link, i) => (
              <li key={link.href} className="flex items-center">
                {i > 0 && <span className="mx-3 text-white/30">|</span>}

                <a
                  href={link.href}
                  className="hover:text-white hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="w-full h-[111px]"
        style={{
          backgroundImage: "url(/maori-pattern.svg)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
        }}
        aria-hidden="true"
      />
    </footer>
  );
}