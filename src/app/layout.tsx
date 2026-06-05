import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NavStudiesProvider } from "@/contexts/NavStudiesContext";
import { getServerLang } from "@/lib/lang";
import { getNavStudies } from "@/lib/nav-studies";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UoA Research",
  description: "University of Auckland Research",
  icons: {
    icon: '/images/logos/hnu-logo.svg',
  },
  // Belt-and-braces with src/app/robots.ts: site-wide noindex until the
  // official launch (flipped by setting ALLOW_INDEXING=1 in the host env).
  ...(process.env.ALLOW_INDEXING === "1"
    ? {}
    : { robots: { index: false, follow: false } }),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();
  const navStudies = await getNavStudies(lang);
  return (
    <html
      lang={lang === "ZH" ? "zh-Hans" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>
          <NavStudiesProvider studies={navStudies}>
            {children}
          </NavStudiesProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

