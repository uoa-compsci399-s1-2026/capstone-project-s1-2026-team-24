# Launch-Readiness Audit — SEO & Go-Live

**Site:** HNU Auckland (bilingual EN / 中文 clinical & nutrition research site — University of Auckland × HNU)
**Stack:** Next.js 16.2.2 (App Router) · React 19 · Prisma 7 + SQLite · Resend · hosted on Render
**Current state:** temporary `*.onrender.com` URL; custom domain (`https://hnu.auckland.ac.nz`, per `.env.example`) arrives at launch
**Date:** 2026-06-04
**Status:** Pre-launch. Audit only — this document recommends changes; it does **not** modify app code.

---

## ⚠️ Read first: the no-index gate is intentional

The site **deliberately** serves a deny-all `robots.txt` and a site-wide `noindex` until `ALLOW_INDEXING=1` is set in the host env. This is **correct pre-launch behaviour and must not be "fixed."**

- `src/app/robots.ts` → `disallow: /` unless `ALLOW_INDEXING === "1"`.
- `src/app/layout.tsx:23-27` → injects `robots: { index: false, follow: false }` unless `ALLOW_INDEXING === "1"` (belt-and-braces).

Everything below assumes this gate stays as-is and is flipped **once**, on launch day, per the runbook in §13.

---

## 1. Executive summary & status matrix

The site has **excellent bilingual title/description coverage** on every public page, and the indexing gate is well-built. The gaps are the **discovery and sharing layer**: no canonical URLs, no `metadataBase`, no sitemap, no Open Graph / Twitter cards, no structured data, no error pages, and an incomplete icon set. None of these touch the (correct) no-index gate.

**Severity model:** 🔴 Launch-blocker · 🟠 High · 🟡 Medium · 🟢 Nice-to-have

| # | Item | Severity | Current state | File(s) |
|---|------|----------|---------------|---------|
| 1 | `metadataBase` set | 🔴 | Absent → canonical/OG can't resolve to absolute URLs | `src/app/layout.tsx` |
| 2 | Canonical URLs (`alternates.canonical`) | 🔴 | 0% of pages; `NEXT_PUBLIC_SITE_URL` exists but is unused in metadata | `src/lib/constants.ts` |
| 3 | `sitemap.ts` | 🔴 | Does not exist | — |
| 4 | `NEXT_PUBLIC_SITE_URL` set in prod | 🔴 | Defaults to `http://localhost:3000`; **build-time** value (§4) | `src/lib/constants.ts` |
| 5 | Open Graph / Twitter cards | 🟠 | 0% of pages; no `opengraph-image` | all pages |
| 6 | robots `Sitemap:` directive | 🟠 | Absent (one-line add) | `src/app/robots.ts` |
| 7 | 404 / 500 pages | 🟠 | No `not-found.tsx`, `error.tsx`, `global-error.tsx` | — |
| 8 | `.onrender.com` → custom-domain redirect | 🟠 | None | `next.config.ts` / `src/middleware.ts` |
| 9 | Structured data (Organization, BreadcrumbList, …) | 🟠/🟡 | None anywhere | — |
| 10 | Favicon / manifest / theme-color | 🟡 | SVG only; no `.ico`, PWA icons, manifest | `src/app/layout.tsx` |
| 11 | Title brand consistency | 🟡 | Root title `"UoA Research"` ≠ brand `"HNU Auckland"` | `src/app/layout.tsx` |
| 12 | hreflang for EN/中文 | 🟢 (documented) | Impossible under cookie-based i18n (§8) | i18n architecture |
| 13 | Resend domain verification | launch step | `EMAIL_FROM` defaults to `onboarding@resend.dev` | `src/lib/email.ts` |
| 14 | Search Console + sitemap submission | launch step | Not set up | — |

**The four 🔴 items share one root fix:** wire `NEXT_PUBLIC_SITE_URL` → `metadataBase` → per-page canonicals, and add `sitemap.ts`. They're addressed together in §4–§5.

---

## 2. How metadata works today (so recommendations fit the codebase)

- **i18n is custom and cookie-based**, *not* `next-intl` and *not* URL-prefixed. A `lang` cookie (`"EN"` | `"ZH"`) is read server-side by `getServerLang()` (`src/lib/lang.ts`); `<html lang>` is set per request in `src/app/layout.tsx`. **There is one URL per page for both languages.**
- Every public page exports `generateMetadata()` that calls the helper `localizedMetadata({ en, zh })` (`src/lib/localized-metadata.ts`), which returns the EN or ZH `Metadata` object based on the cookie.
- All public pages are `export const dynamic = "force-dynamic"`.
- Site identity lives in `src/lib/constants.ts`: `SITE_NAME = "HNU Auckland"`, `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`.

**Implication:** the cleanest fixes *extend the existing `localizedMetadata` pattern* rather than hand-editing 13 pages. See the `buildPageMetadata` helper in §4.

---

## 3. Per-page metadata completeness

Public routes and what each currently declares:

| Route | File | Title | Desc | OG | Twitter | Canonical | hreflang |
|-------|------|:----:|:----:|:--:|:------:|:--------:|:-------:|
| `/` | `src/app/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/about` | `src/app/about/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/team` | `src/app/team/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/research` | `src/app/research/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/studies` | `src/app/studies/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/studies/ferdinand` | `src/app/studies/ferdinand/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/studies/food-beverage` | `…/food-beverage/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/studies/nz-synergy` | `…/nz-synergy/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/studies/[slug]` | `src/app/studies/[slug]/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/contact` | `src/app/contact/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/collaborations` | `src/app/collaborations/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/collaborations/academic` | `…/academic/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/collaborations/industry` | `…/industry/page.tsx` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/collaborations/funding` | `…/funding/page.tsx` | — | — | — | — | — | — (301 → `/contact`; correctly excluded everywhere) |

**Coverage:** titles + descriptions **100%** (bilingual). Open Graph, Twitter, canonical, hreflang: **0%**.

**Brand inconsistency (🟡):** the root default title is `"UoA Research"` (`src/app/layout.tsx:18`), but the brand constant is `"HNU Auckland"` and the study pages manually suffix `" | HNU Auckland"`. Standardise via a `title.template` (§4) so every page reads `… | HNU Auckland`.

---

## 4. Canonical URLs, `metadataBase`, and `NEXT_PUBLIC_SITE_URL` 🔴

**Problem:** `NEXT_PUBLIC_SITE_URL` flows into `SITE_URL` but is never used in metadata. Without `metadataBase`, Next.js cannot resolve canonical/OG URLs to absolute, and no page declares `alternates.canonical`. At launch, search engines and social crawlers need absolute, canonical, custom-domain URLs.

> **⚠️ Build-time gotcha.** `NEXT_PUBLIC_*` variables are **inlined at build time**, not read at runtime. Setting `NEXT_PUBLIC_SITE_URL` after the build won't change baked canonicals/OG URLs — it must be set **before/at the production build**. (Contrast: `ALLOW_INDEXING` is read at request time in `robots.ts` and `layout.tsx`, so *that* one can be flipped with a restart/redeploy.)

### 4a. Root metadata — add `metadataBase`, `title.template`, default OG/Twitter

```ts
// src/app/layout.tsx — REFERENCE (keep the ALLOW_INDEXING gate exactly as-is)
import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — University of Auckland Research`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "University of Auckland Research",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NZ",
    alternateLocale: ["zh_CN"],
    // A default OG image is provided by app/opengraph-image.tsx (see §12).
  },
  twitter: { card: "summary_large_image" },
  // Site-wide noindex until launch — UNCHANGED.
  ...(process.env.ALLOW_INDEXING === "1"
    ? {}
    : { robots: { index: false, follow: false } }),
};

// themeColor moved to the `viewport` export in Next 14+/16 (NOT `metadata`).
export const viewport: Viewport = { themeColor: "#0c0c48" };
```

### 4b. A `buildPageMetadata` helper — one change instead of 13

Evolve the existing `localizedMetadata` pattern into a helper that also emits the canonical and per-page OG/Twitter from the localized strings:

```ts
// src/lib/page-metadata.ts — REFERENCE (new helper, extends localized-metadata.ts)
import type { Metadata } from "next";
import { getServerLang } from "@/lib/lang";
import { SITE_NAME } from "@/lib/constants";

type L = { en: string; zh: string };

export async function buildPageMetadata(opts: {
  path: string;          // relative, resolved against metadataBase, e.g. "/studies"
  title: L;
  description: L;
  image?: string;        // optional; falls back to app/opengraph-image.tsx
}): Promise<Metadata> {
  const isZh = (await getServerLang()) === "ZH";
  const title = isZh ? opts.title.zh : opts.title.en;
  const description = isZh ? opts.description.zh : opts.description.en;
  return {
    title,
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      title, description, url: opts.path, siteName: SITE_NAME,
      locale: isZh ? "zh_CN" : "en_NZ", type: "website",
      ...(opts.image ? { images: [{ url: opts.image }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(opts.image ? { images: [opts.image] } : {}),
    },
  };
}
```

Each page then changes from `localizedMetadata({ en:{title,description}, zh:{title,description} })` to:

```ts
// e.g. src/app/studies/page.tsx
export async function generateMetadata() {
  return buildPageMetadata({
    path: "/studies",
    title: { en: "Our Studies", zh: "研究项目" },
    description: { en: "Take part in advancing nutrition science…", zh: "参与推动营养科学发展…" },
  });
}
```

For the dynamic study page, the canonical is its own slug:

```ts
// src/app/studies/[slug]/page.tsx — inside generateMetadata, after fetching `study`
return buildPageMetadata({
  path: `/studies/${slug}`,
  title: { en: study.title, zh: zhTitle },
  description: { en: study.shortDescription, zh: zhDescription },
  image: study.imagePath || undefined,
});
```

> Note: `title.template` applies to the document `<title>` only, not `openGraph.title`. If you want the brand in OG titles too, append it in the helper.

---

## 5. `sitemap.ts` 🔴 (with the studies dedupe subtlety)

**It does not exist.** The tricky part is the studies routes:

- `/studies/[slug]/page.tsx` resolves **any active `Study`** row (`prisma.study.findFirst({ where:{ slug } })`, else `notFound()`).
- `/studies/ferdinand`, `/studies/food-beverage`, `/studies/nz-synergy` are **hardcoded app routes** that **always render** — *and* are **seeded as active `Study` rows** (`prisma/seed.ts`). So they exist at the same `/studies/{slug}` URL twice over.
- The studies **list** page renders admin page-builder blocks (`renderPageBlocks("studies")`), so page-builder `Page` rows do **not** create extra public URLs.

Therefore the sitemap = static routes + the always-present hardcoded study slugs ∪ active DB study slugs, **deduped by URL**. Exclude `/admin/*`, `/api/*`, and `/collaborations/funding`.

```ts
// src/app/sitemap.ts — REFERENCE (does not exist yet)
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

const STATIC_PATHS = [
  "", "/about", "/team", "/research", "/studies",
  "/contact", "/collaborations", "/collaborations/academic", "/collaborations/industry",
] as const;

// Hardcoded study routes that always render, independent of the DB.
const PERMANENT_STUDY_SLUGS = ["ferdinand", "food-beverage", "nz-synergy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/studies" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const studies = await prisma.study.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const lastMod = new Map<string, Date>();
  for (const s of PERMANENT_STUDY_SLUGS) lastMod.set(s, now);
  for (const s of studies) lastMod.set(s.slug, s.updatedAt); // DB wins on lastModified

  const studyEntries: MetadataRoute.Sitemap = [...lastMod].map(([slug, lastModified]) => ({
    url: `${SITE_URL}/studies/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...studyEntries];
}
```

Notes:
- `force-dynamic` pages don't affect the sitemap — `sitemap()` runs at request/build time and Next serves `/sitemap.xml`.
- Absolute URLs use `SITE_URL`, so the **build-time** `NEXT_PUBLIC_SITE_URL` must be the custom domain at the production build (§4).

### 5a. Add the `Sitemap:` directive to robots 🟠

One line, gate untouched:

```ts
// src/app/robots.ts — REFERENCE (add `sitemap`/`host`; keep the gate)
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.ALLOW_INDEXING === "1";
  return {
    rules: allowIndexing
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

---

## 6. Structured data (JSON-LD) 🟠/🟡

There is **none** today. A tiny server component keeps it tidy:

```tsx
// src/components/seo/JsonLd.tsx — REFERENCE
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**Opportunities, by priority:**

| Schema | Where | Priority | Notes |
|--------|-------|----------|-------|
| `Organization` | root layout / `/about` | 🟠 | identity, logo, `parentOrganization` = University of Auckland, `ContactPoint`, `sameAs` socials |
| `BreadcrumbList` | `/studies/[slug]`, `/collaborations/*` | 🟠 | study pages already render a visible breadcrumb — cheap, well-supported |
| `WebSite` (+ `SearchAction`) | root layout | 🟡 | **only** add `SearchAction` if a *public* `/search?q=…` results page exists — verify; `/api/search` looks like an internal JSON endpoint, which does **not** qualify |
| `MedicalStudy` | `/studies/[slug]` | 🟡 | genuinely fits (status/eligibility/contact). **Caveat:** Google has **no rich result** for it — value is entity understanding, not a SERP snippet. Confirm enum/property choices with a human |
| `Person` | `/team` | 🟢 | `name`, `jobTitle`, `image`, `sameAs` → ORCID/profile (`TeamMember.orcidId`, `profileUrl`) |
| `ScholarlyArticle` | `/research` | 🟢 | publications are ORCID-synced; low priority |

**Examples:**

```ts
// Organization — root layout (rendered via <JsonLd data={organization} />)
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HNU Auckland",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logos/hnu-logo.svg`,
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "University of Auckland",
    url: "https://www.auckland.ac.nz",
  },
  sameAs: [/* LinkedIn / X / etc. — fill in real profiles */],
};

// BreadcrumbList — /studies/[slug]
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Studies", item: `${SITE_URL}/studies` },
    { "@type": "ListItem", position: 2, name: study.title, item: `${SITE_URL}/studies/${study.slug}` },
  ],
};

// MedicalStudy — /studies/[slug] (verify enum values for `status`)
const medicalStudy = {
  "@context": "https://schema.org",
  "@type": "MedicalStudy",
  name: study.title,
  description: study.shortDescription,
  status: study.status, // e.g. "recruiting" | "active, not recruiting" | "completed"
  sponsor: { "@type": "Organization", name: "HNU Auckland" },
  studyLocation: { "@type": "AdministrativeArea", name: "Auckland, New Zealand" },
};
```

---

## 7. hreflang & bilingual SEO 🟢 (recommend, don't block)

**The honest finding:** real `hreflang` is **not achievable under the current cookie-based i18n.** `hreflang` requires a *distinct, crawlable URL per language*. With one URL serving both EN and 中文 (language chosen by a cookie after load), you **cannot** point `hreflang="en"` and `hreflang="zh-Hans"` at the *same* URL and have Google honour it — search engines only ever see (and index) one rendering of that URL.

**Decision (confirmed): recommend, don't block launch.** Launch with the realistic minimum, and treat full bilingual SEO as post-launch work.

### Launch minimum (no architecture change)
1. **Self-canonical** on every page (from §4) — prevents duplicate-URL confusion.
2. **Accurate `<html lang>`** — already correct (`en` / `zh` per request).
3. **`x-default`** pointing to the canonical URL, e.g. via `alternates.languages` with only an `x-default` entry.
4. Accept that, initially, **one language indexes per URL** (whichever the crawler sees — effectively EN, the default).

### Post-launch: URL-based locales (the real fix)
To get both languages indexed, give each its own URL — `/en/…` and `/zh-Hans/…` (use **`zh-Hans`**, the script subtag, not `zh` or `zh-CN`). Two routes:
- **Migrate to `next-intl`** (or App Router `[locale]` segments) with middleware locale negotiation, then emit reciprocal `alternates.languages` (`en`, `zh-Hans`, `x-default`).
- This is a **structural refactor** (routing, the `lang` cookie/context, links, the sitemap → 2× entries). Estimate it as a dedicated piece of work, not a launch-day task.

> Until then, the `lang` cookie model is fine for users; it just limits *bilingual* search visibility.

---

## 8. 404 / 500 pages 🟠

None exist (`not-found.tsx`, `error.tsx`, `global-error.tsx`) → users hit Next's default error screens. `notFound()` is already called for inactive/missing studies, so a branded 404 has immediate value.

```tsx
// src/app/not-found.tsx — REFERENCE (server component, bilingual via cookie)
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getServerLang } from "@/lib/lang";

export default async function NotFound() {
  const isZh = (await getServerLang()) === "ZH";
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-white flex flex-col items-center justify-center py-32 px-6 text-center">
        <p className="text-[#1f2bd4] font-semibold tracking-widest uppercase">404</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold text-[#0c0c48]">
          {isZh ? "页面未找到" : "Page not found"}
        </h1>
        <p className="mt-4 max-w-xl text-[#0c0c48]/70">
          {isZh ? "抱歉，您访问的页面不存在或已被移动。"
                : "Sorry, the page you’re looking for doesn’t exist or has moved."}
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-[#0c0c48] px-6 py-3 text-white">
          {isZh ? "返回首页" : "Back to home"}
        </Link>
      </main>
      <Footer />
    </>
  );
}
```

```tsx
// src/app/error.tsx — REFERENCE (must be a client component; uses the language context)
"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isZh = useLanguage().lang === "ZH";
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-extrabold text-[#0c0c48]">{isZh ? "出错了" : "Something went wrong"}</h1>
      <p className="mt-4 text-[#0c0c48]/70">{isZh ? "请稍后重试。" : "Please try again in a moment."}</p>
      <button onClick={reset} className="mt-8 rounded-full bg-[#0c0c48] px-6 py-3 text-white">
        {isZh ? "重试" : "Try again"}
      </button>
    </main>
  );
}
```

```tsx
// src/app/global-error.tsx — REFERENCE (replaces the root layout → must render <html>/<body>;
// LanguageProvider is NOT available here, so fall back to English. Runs only in production.)
"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui, sans-serif", textAlign: "center", margin: 0 }}>
        <div>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

---

## 9. Favicon, icons & manifest 🟡

**Current:** only `icons: { icon: '/images/logos/hnu-logo.svg' }` in root metadata. Missing `favicon.ico`, PNG PWA icons (192/512), `apple-icon` (180), a web manifest, and `theme-color`.

**Recommended (App Router file conventions — drop files into `src/app/`, Next auto-emits the tags):**

```
src/app/favicon.ico          # 16/32 multi-res .ico (legacy + tab)
src/app/icon.svg             # vector icon (copy of hnu-logo.svg)
src/app/apple-icon.png       # 180×180 (iOS home screen)
public/icon-192.png          # PWA (referenced by manifest)
public/icon-512.png          # PWA
public/icon-512-maskable.png # PWA maskable (safe-zone padded)
```

Using file conventions means you can **delete the manual `icons` block** from root metadata. Add a manifest:

```ts
// src/app/manifest.ts — REFERENCE
import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — University of Auckland Research`,
    short_name: SITE_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0c0c48", // BRAND_COLORS.uoaWaitemata
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

Generate the PNG/ICO sizes from `public/images/logos/hnu-logo.svg`. (`theme-color` comes from the `viewport` export in §4a.)

---

## 10. Open Graph / Twitter images 🟠 / 🟢

No share image today → social posts render bare. With `images.unoptimized: true` set in `next.config.ts`, a generated OG image is the simplest robust option:

```tsx
// src/app/opengraph-image.tsx — REFERENCE (branded default; also serves Twitter)
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HNU Auckland — University of Auckland Research";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: 80, background: "#0c0c48", color: "white",
        fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 64, fontWeight: 800 }}>HNU Auckland</div>
        <div style={{ fontSize: 32, marginTop: 16, opacity: 0.85 }}>University of Auckland Research</div>
      </div>
    ),
    size,
  );
}
```

- 🟠 The single branded default above covers the whole site.
- 🟢 Optional: a per-study `src/app/studies/[slug]/opengraph-image.tsx` that renders `study.title` for richer study shares.

---

## 11. Redirect strategy — `.onrender.com` → custom domain 🟠

At launch, Render serves the site on **both** the temp `*.onrender.com` host and the custom domain. To consolidate SEO signals and stop users landing on the temp URL, **301 the onrender host to the custom domain.** Keep `ALLOW_INDEXING` unset on any preview so it stays no-indexed regardless.

**Recommended — declarative, no middleware-matcher change:**

```ts
// next.config.ts — REFERENCE (host canonicalization; evaluated at build)
import type { NextConfig } from "next";

const ONRENDER_HOST = process.env.RENDER_EXTERNAL_HOSTNAME;           // Render sets this, e.g. hnu-xyz.onrender.com
const CANONICAL_HOST = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : undefined;       // e.g. hnu.auckland.ac.nz

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    // No-op until a real custom domain differs from the onrender host
    // (so previews on *.onrender.com keep working).
    if (!ONRENDER_HOST || !CANONICAL_HOST || ONRENDER_HOST === CANONICAL_HOST) return [];
    return [{
      source: "/:path*",
      has: [{ type: "host", value: ONRENDER_HOST }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true, // 301
    }];
  },
};
export default nextConfig;
```

**Alternative — middleware.** `src/middleware.ts` already exists (admin auth) but its `matcher` is scoped to `/admin` + `/api/admin`. Host canonicalization would require broadening the matcher to all routes, so the `next.config` approach above is lower-risk. Either way, gate it on the custom domain being live to avoid redirect loops.

> Because `CANONICAL_HOST` derives from the **build-time** `NEXT_PUBLIC_SITE_URL`, the redirect activates only in the production build that has the custom domain set — exactly when you want it.

---

## 12. Environment variables — build-time vs runtime

| Variable | Read at | Launch value | Used by |
|----------|---------|--------------|---------|
| `NEXT_PUBLIC_SITE_URL` | **build** | `https://hnu.auckland.ac.nz` | `SITE_URL` → metadataBase, canonicals, sitemap, OG, redirect |
| `ALLOW_INDEXING` | **runtime** | `1` (launch only) | `robots.ts`, `layout.tsx` |
| `RESEND_API_KEY` | runtime | real key | `src/lib/email.ts` |
| `EMAIL_FROM` | runtime | `HNU Website <noreply@hnu.auckland.ac.nz>` (verified domain) | `src/lib/email.ts` |
| `DATABASE_URL` | runtime | absolute `file:` path on the persistent disk | Prisma |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | runtime | strong, non-placeholder | admin auth |
| `TRANSLATE_API_KEY` (+ `TRANSLATE_REGION`) | build/warm | optional (中文 copy translation) | `npm run warm:translations` |

(See `docs/environment.md` for the full reference and `.env` precedence.)

---

## 13. Launch-day runbook

Builds on the storage/secrets checklist already in `docs/deployment.md` (persistent SQLite volume, `public/uploads/` persistence, `prisma db push`, seed-once, HTTPS, Node 20+) — do that first; the steps below add the SEO/go-live layer.

1. **Pre-flight on staging** (`*.onrender.com`, `ALLOW_INDEXING` **unset**):
   - `npm run verify` (tsc + eslint + vitest) is green.
   - `curl https://<staging>.onrender.com/robots.txt` → `Disallow: /`; view-source shows the `noindex` meta. (Confirms the gate still hides staging.)
2. **Provision the custom domain** in Render: add `hnu.auckland.ac.nz`, set the DNS record Render asks for (CNAME, or ALIAS/ANAME at an apex), wait for the Let's Encrypt TLS cert.
   - ⚠️ **Dependency/lead-time risk:** `auckland.ac.nz` DNS is almost certainly university-IT controlled. Request the record (and the Resend records in step 4) early; you may be given only a managed subdomain.
3. **Set the production build env** and trigger a build:
   - `NEXT_PUBLIC_SITE_URL=https://hnu.auckland.ac.nz` — **must be present at build** (baked into canonicals/OG/sitemap/redirect).
   - Secrets: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, absolute `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
4. **Resend domain verification:**
   - Add the sending domain in the Resend dashboard; add the **SPF (TXT)**, **DKIM (CNAME/TXT)**, and optional **DMARC** records to DNS; wait for "Verified."
   - Set `EMAIL_FROM` to an address on that domain (e.g. `noreply@hnu.auckland.ac.nz`). Consider a dedicated sending subdomain (e.g. `mail.hnu.auckland.ac.nz`) if you can't add records at the apex.
   - **Test the contact form end-to-end:** submit → email received, `Reply-To` = enquirer's address (`src/lib/email.ts`).
5. **Deploy:** build with the env above; `prisma db push`; seed **only** on first deploy; confirm the site loads over HTTPS on the custom domain.
6. **Verify the redirect:** `curl -I https://<staging>.onrender.com/` → `301` to `https://hnu.auckland.ac.nz/` (§11).
7. **Flip indexing:** set `ALLOW_INDEXING=1` and restart/redeploy. Verify:
   - `curl https://hnu.auckland.ac.nz/robots.txt` → `Allow: /` **and** a `Sitemap:` line.
   - View-source on a few pages → **no** `noindex` meta; `<link rel="canonical">` points to the custom domain.
   - `https://hnu.auckland.ac.nz/sitemap.xml` → `200`, absolute custom-domain URLs, studies deduped.
8. **Search Console:** add the property (Domain property via DNS TXT, or URL-prefix `https://hnu.auckland.ac.nz`), verify, **submit `sitemap.xml`**, and request indexing for the home + key study pages. (Optional: Bing Webmaster Tools. For 中文 reach, Baidu Webmaster is possible but involves ICP-licensing complexity — out of scope here.)
9. **Post-launch validation:**
   - Google **Rich Results Test** on `/` and a study page (JSON-LD parses).
   - **Facebook Sharing Debugger**, **LinkedIn Post Inspector**, **X Card Validator** (OG/Twitter render).
   - **Lighthouse** SEO audit (target ~100).
   - Watch Search Console **Coverage/Pages** for crawl errors over the first weeks.
10. **Rollback:** set `ALLOW_INDEXING=0` and redeploy to instantly re-hide if something's wrong.

---

## 14. Appendix

### 14a. Recommended new/changed files (for whoever implements the fixes)

| File | Action | Severity |
|------|--------|----------|
| `src/app/layout.tsx` | add `metadataBase`, `title.template`, default OG/Twitter, `viewport.themeColor`; drop manual `icons` if using file conventions | 🔴/🟡 |
| `src/lib/page-metadata.ts` | new `buildPageMetadata` helper | 🔴 |
| every public `page.tsx` | switch to `buildPageMetadata` (canonical + OG/Twitter) | 🔴 |
| `src/app/sitemap.ts` | new (deduped studies) | 🔴 |
| `src/app/robots.ts` | add `sitemap`/`host` (gate unchanged) | 🟠 |
| `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx` | new | 🟠 |
| `next.config.ts` | host-canonicalization `redirects()` | 🟠 |
| `src/components/seo/JsonLd.tsx` + per-page JSON-LD | new | 🟠/🟡 |
| `src/app/opengraph-image.tsx` (+ optional per-study) | new | 🟠/🟢 |
| `src/app/manifest.ts` + icon files | new | 🟡 |

### 14b. Open decisions for the team
1. **Resend domain:** apex `hnu.auckland.ac.nz` vs a dedicated sending subdomain (DNS-control dependent).
2. **OG images:** the single branded default (recommended) vs per-study generated images.
3. **Bilingual SEO:** whether/when to do the URL-locale migration (§7) — the only path to indexing both EN and 中文.
4. **`WebSite`/`SearchAction`:** include only if a public `/search` results page is built.
5. **`MedicalStudy` JSON-LD:** confirm property/enum choices with someone who knows the studies (no Google rich result, so this is for entity understanding).

### 14c. Files reviewed for this audit (not modified)
`src/app/layout.tsx` · `src/app/robots.ts` · `src/lib/constants.ts` · `src/lib/localized-metadata.ts` · `src/lib/lang.ts` · `src/app/page.tsx` and all public `*/page.tsx` · `src/app/studies/[slug]/page.tsx` · `src/app/studies/{ferdinand,food-beverage,nz-synergy}/page.tsx` · `src/app/studies/page.tsx` · `src/components/blocks/study/resolve-study-layout.ts` · `src/middleware.ts` · `next.config.ts` · `src/lib/email.ts` · `prisma/schema.prisma` · `prisma/seed.ts` · `docs/deployment.md` · `docs/environment.md` · `.env.example`

---

*Audit only. The `ALLOW_INDEXING` no-index gate is intentional and must remain until launch day (§13, step 7). No app code was changed by this report.*
