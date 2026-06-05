import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { NavStudiesProvider } from "@/contexts/NavStudiesContext";
import { getServerLang } from "@/lib/lang";
import { getSiteSettings } from "@/lib/site-settings";
import { getNavStudies } from "@/lib/nav-studies";

// Inter is the site's body font. next/font self-hosts a WOFF2 latin subset at
// build time with font-display: swap (no FOIT, no ~2.4MB of OTF on every page),
// exposed as the --font-sans token. Geist Mono stays for admin `font-mono`.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
  // Independent server reads — resolve them together. Both seed client
  // providers so the Navbar renders the right logos and studies on first paint.
  const [navStudies, siteSettings] = await Promise.all([
    getNavStudies(lang),
    getSiteSettings(),
  ]);
  return (
    <html
      lang={lang === "ZH" ? "zh-Hans" : "en"}
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={lang}>
          <SiteSettingsProvider settings={siteSettings}>
            <NavStudiesProvider studies={navStudies}>
              {children}
            </NavStudiesProvider>
          </SiteSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
