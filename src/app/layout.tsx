import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getServerLang } from "@/lib/lang";
import { getSiteSettings } from "@/lib/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata is generated (not static) so the favicon follows the admin-set
// branding (SiteSettings); the read is cached across requests.
export async function generateMetadata(): Promise<Metadata> {
  const { faviconPath } = await getSiteSettings();
  return {
    title: "UoA Research",
    description: "University of Auckland Research",
    icons: {
      icon: faviconPath,
    },
    // Belt-and-braces with src/app/robots.ts: site-wide noindex until the
    // official launch (flipped by setting ALLOW_INDEXING=1 in the host env).
    ...(process.env.ALLOW_INDEXING === "1"
      ? {}
      : { robots: { index: false, follow: false } }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();
  const siteSettings = await getSiteSettings();
  return (
    <html
      lang={lang === "ZH" ? "zh-Hans" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>
          <SiteSettingsProvider settings={siteSettings}>
            {children}
          </SiteSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

