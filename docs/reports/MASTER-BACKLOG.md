# Master Backlog — Audit Triage

*One prioritized, de-duplicated, globally re-ranked backlog synthesised from the seven
parallel audits (PRs #169–#175) plus the parent `architecture-audit.md`. Produced
2026-06-04 by a lead + seven normalisation subagents (one per report). Every
Critical/High item — and every architecture-audit finding — was re-checked against the
**current** source before landing here.*

> **Read this, not the seven reports, first.** Each row links back to its source
> report(s) for full detail, repro steps, and fix sketches.

## Context

The app is the HNU Auckland site: **Next.js 16 · React 19 · Prisma 7 /
better-sqlite3 (file SQLite) · Tailwind v4**, deployed on a single **512 MB Render
Starter** instance. Three constraints shaped the ranking:

- **There is NO CI.** GitHub Actions are disabled org-wide (billing); `npm run verify`
  (`tsc --noEmit && eslint && vitest run --project api`) is the *manual* merge gate.
- **Merging to `main` deploys production.** So work is sized to be **small, isolated,
  and individually `verify`-able**; large refactors are deferred and should land
  **tests-first**.
- **512 MB RAM is the real ceiling.** Memory-pressure items outrank pure-latency ones.

The seven audits were run independently, so they overlap, use **five different severity
scales**, and mostly carry no effort estimate. This document normalises all of that to
one scale, **de-duplicates** cross-report findings, and proposes a **next-sprint vs
post-launch** split.

## How to read this

- **Severity** (normalised): **Critical** = anon-exploitable / data-loss / crash /
  hard blocker · **High** = serious security/correctness/UX-blocking, or a launch
  blocker gating a safe go-live · **Medium** = meaningful but non-blocking · **Low** =
  polish / housekeeping.
- **Effort**: **S** = one file / config / one-liner (<½ day) · **M** = multi-file
  (hours–2 days) · **L** = cross-cutting / architectural (>2 days).
- **✓** column: `✅` = confirmed against current source (lead and/or subagent read the
  code) · `≈` = confirmed with minor line drift / not every cited line re-opened ·
  `ext` = external/ops action, not source-verifiable.
- **ID** is this backlog's stable id; **Source** cites the originating report finding(s).

## At a glance

| Severity | Open items | Notes |
|---|---:|---|
| Critical | 0 | No anon-exploitable / data-loss / crash bug found reproducibly. |
| High | 26 | 12 are launch go-live blockers; the rest are security front-door, a11y-critical, perf-P1, and the partner-logos crash. |
| Medium | 18 | |
| Low | 19 | Grouped at the bottom; nothing dropped. |

**Coverage:** 95 raw findings across 8 reports → **63 de-duplicated backlog items**
(+ 6 verified-resolved, + a false-positive register).

### Top 8 to do first (highest leverage, mostly S, launch-or-crash)

1. **B01** — set `NEXT_PUBLIC_SITE_URL` at *build* time (prereq for all SEO below).
2. **B02–B04** — `metadataBase` + per-page canonical (one `buildPageMetadata` helper) + `sitemap.ts`.
3. **B14** — clamp the partner-logos `order` fallback (one-line fix for an admin-list crash).
4. **B15** — bump Next.js 16.2.2 → 16.2.7 (clears the App-Router middleware-bypass advisory).
5. **B16** — add rate-limiting to the admin login (reuse the existing `src/lib/rate-limit.ts`).
6. **B09** — verify the Resend sending domain + set `EMAIL_FROM` (else the contact form silently fails in prod).
7. **B25 + B26** — fonts (`font-display` + WOFF2, drop the redundant family) and the Navbar double-`/api/search` fire (every page, 512 MB).
8. **B33** — add the five critical-path unit tests (auth/session, sanitize, safe-url, rate-limit, order) — cheap insurance with no CI.

---

## Global prioritized backlog

### 🔴 High (B01–B26)

#### Launch go-live blockers (from the launch-readiness audit)

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B01 | Set `NEXT_PUBLIC_SITE_URL` to the custom domain **at production build time** (it is inlined, not read at runtime) | S | launch L4 | `src/lib/constants.ts:3`, build env | ✅ |
| B02 | Add `metadataBase: new URL(SITE_URL)` to root metadata so canonical/OG resolve absolute | M | launch L1 | `src/app/layout.tsx:17-28` | ✅ |
| B03 | Emit per-page `alternates.canonical` on every public page via a new `buildPageMetadata` helper | M | launch L2 | `src/lib/page-metadata.ts` (new), all `page.tsx`, `localized-metadata.ts` | ✅ |
| B04 | Create `src/app/sitemap.ts` = static routes ∪ permanent study slugs ∪ active DB slugs, **deduped by URL**; exclude `/admin`,`/api`,`/collaborations/funding` | M | launch L3 (+ debt DEBT-9) | `src/app/sitemap.ts` (new); `prisma/seed.ts:62,91,119` | ✅ |
| B05 | Add default + per-page Open Graph / Twitter card metadata (root defaults + helper) | M | launch L5 | `src/app/layout.tsx`, `page-metadata.ts` | ✅ |
| B06 | Add the `Sitemap:`/`host:` directive to `robots.ts` (leave the deny-all gate untouched) | S | launch L6 | `src/app/robots.ts:8-15` | ✅ |
| B07 | Add branded bilingual `not-found.tsx`, `error.tsx`, `global-error.tsx` | M | launch L7 | `src/app/{not-found,error,global-error}.tsx` (new) | ✅ |
| B08 | Add the `.onrender.com` → custom-domain **301** (declarative `redirects()` in `next.config`, gated on the custom host being live) | S | launch L8 | `next.config.ts:3-10` | ✅ |
| B09 | Verify the Resend sending domain (SPF/DKIM/DMARC) and set `EMAIL_FROM` off the `onboarding@resend.dev` default — **else the contact form only emails the account owner in prod** | S | launch L17 | `src/lib/email.ts:21-22`, DNS | ✅ |
| B10 | Provision the custom domain + DNS/TLS in Render — **start early**, UoA-IT-controlled records have lead time | S | launch L20 | external infra/DNS | ext |
| B11 | Fix the root title brand: `"UoA Research"` → a brand `title.default` + a per-page title template ending in "HNU Auckland" | S | launch L13 | `src/app/layout.tsx:18`, `constants.ts:2` | ✅ |
| B12 | Set strong, high-entropy `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` in Render env (no defaults reach the deploy) | S | sec F11 + arch #3 | Render env | ext |
| B13 | **Launch-day trigger:** flip `ALLOW_INDEXING=1`, then verify robots Allow + no `noindex` + canonical + sitemap 200 | S | launch L19 | host env; `robots.ts:9`, `layout.tsx:25` | ✅ |

#### Security front-door & correctness crashers

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B14 | Wrap the partner-logos auto-increment `order` fallback in `clampOrder` so `MAX_ORDER+1` can't be written (it later **crashes the admin list read**) | S | bugs H1 + arch #8 | `src/app/api/admin/partner-logos/route.ts:150-151,162`; `src/lib/order.ts` | ✅ |
| B15 | Bump `next` + `eslint-config-next` 16.2.2 → 16.2.7 in lockstep (run `verify` **and** `build`); clears the App-Router **middleware-bypass** advisory — and 100% of admin authz is middleware | S | sec F2 + deps DEPS-1 | `package.json:38,62` | ✅ |
| B16 | Add brute-force/rate-limiting (+ constant-time compare) to the admin login — reuse the existing `src/lib/rate-limit.ts` | S | sec F1 | `src/app/api/admin/auth/login/route.ts:26` | ✅ |
| B17 | Remove (or `NODE_ENV`/middleware-gate) the unauthenticated `/api/test/{prisma,orcid}` debug endpoints — anon DB-count + outbound ORCID amplifier on the 512 MB box | S | sec F6 + debt DEBT-3 + arch #1 | `src/app/api/test/{prisma,orcid}/route.ts`; `src/middleware.ts:44-46` | ✅ |
| B18 | Add HTTP security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, HSTS, Permissions-Policy) via `next.config.ts` | S | sec F3 | `next.config.ts` | ✅ |
| B19 | Add per-IP rate-limiting (+ optional short-TTL cache) to `GET /api/search` (DoS on 512 MB) | S | sec F4 | `src/app/api/search/route.ts:9,166-245` | ✅ |

#### Accessibility — WCAG-critical on core flows

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B20 | Wire contact/join form errors: `required`/`aria-required`, `aria-invalid`+`aria-describedby` per field, `role="status"` on success, non-colour error cues | M | a11y A11Y-04 | `ContactEmailForm.tsx:124,238-242`; `JoinStudyForm.tsx:119,218-222` | ✅ |
| B21 | Fix form-UI contrast: input borders ≥3:1, error red → red-600+, helper text; treat `#00caef` as decorative-only | M | a11y A11Y-03 | `globals.css:37,41,42`; `ContactEmailForm.tsx:22,28`; `AdminForm.tsx:111,182` | ✅ |
| B22 | Give the mobile nav drawer a focus-trap + Escape (reuse the search-dialog trap) and add `aria-expanded` to the toggle/accordions | M | a11y A11Y-02 | `src/components/layout/Navbar.tsx:737-739,758-764,256-284` | ✅ |
| B23 | Stop block images defaulting to `alt=""`: propagate `MediaAsset.altText` through media-resolve, and label/warn on empty alt in the editor *(stageable: quick "warn + stop silent empty" now; full propagation is L)* | L | a11y A11Y-01 (+ A11Y-14) | `BlockRenderer.tsx:76,88,257`; `media/route.ts:68`; `schema.prisma:314`; `fields.tsx:251-256` | ✅ |

#### Performance — P1 (every page / memory)

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B24 | Convert Inter to WOFF2 via `next/font/local` (gets `font-display: swap`) and drop the redundant second font family — ~2.4 MB of OTF on every page | S | perf P2-fonts | `globals.css:3-29,59-63`; `layout.tsx:7-15`; `public/fonts/Inter-*.otf` | ✅ |
| B25 | Delete the duplicated debounced-search effect in Navbar so each keystroke fires `/api/search` **once**, not twice | S | perf P1a | `src/components/layout/Navbar.tsx:136-180,192-222` | ✅ |
| B26 | Server-render `RecentPublications` with `take:N` + narrow `select`; add a bounded `?take=` to `/api/publications` (homepage currently ships the **whole** publications table to show 2 cards) | S | perf P3-pubs | `RecentPublications.tsx:22-42`; `src/app/api/publications/route.ts:6-34` | ✅ |

### 🟠 Medium (B27–B44)

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B27 | Recompress/resize oversized source assets (logos <50 KB, photos <200 KB, prefer WebP; SVGO the 2 big SVGs) — source size == wire size (optimizer off) | S | perf P4-img | `public/images/partners/PFR-print.jpg` (722 KB) + 7 others | ✅ |
| B28 | Add `loading="lazy"`/`decoding="async"`/intrinsic dims to partner-marquee `<img>`s; drop the blanket `priority={i<8}` | S | perf P4-marquee | `OurPartners.tsx:11,31-43`; `PartnerImageGrid.tsx:70` | ✅ |
| B29 | Strengthen the case-studies DELETE id guard to `Number.isInteger && >0` (400, not a 500) | S | bugs M3 | `src/app/api/admin/case-studies/[id]/route.ts:14-21` | ✅ |
| B30 | Emit a prod-visible signal (log/telemetry/admin placeholder) for unknown block types instead of silent `null` | S | bugs M2 | `BlockRenderer.tsx:372-376` | ✅ |
| B31 | Localise the study date badge with `lang` instead of hardcoded `en-NZ` | S | bugs M1 | `StudyBlocks.tsx:33-39` | ✅ |
| B32 | Add a web manifest, favicon.ico + PWA icons (192/512/maskable + apple-icon) and `theme-color` via the `viewport` export | M | launch L10,L11,L12 | `src/app/{manifest.ts,favicon.ico,icon.svg,apple-icon.png}` (new) | ✅ |
| B33 | Add the 5 highest-value unit tests: admin-session (login/logout/expiry), `safe-url`, `sanitize`, `rate-limit`, partner-logos `order` | M | debt DEBT-36/37/38/40 (+ bugs H1) | `src/lib/{admin-session,safe-url,sanitize,rate-limit,order}.ts` | ✅ |
| B34 | Add a focusable "Skip to content" link → `#main-content` (the target already exists) | S | a11y A11Y-05 | `render-page.tsx:75`; `src/app/layout.tsx` | ✅ |
| B35 | Make the admin media picker a real dialog: `role="dialog" aria-modal`, name, focus-trap, Escape, focus-restore | M | a11y A11Y-07 + arch #15 | `src/components/admin/media/MediaPicker.tsx:93-95` | ✅ |
| B36 | Enforce one `<h1>` per page (hero → h1), fix skipped levels & duplicate responsive headings | M | a11y A11Y-06 | `HomepageHero.tsx:61`; `PublicationIndex.tsx:228`; +5 sections | ≈ |
| B37 | Carousel a11y: `aria-roledescription="carousel"` + label, hide off-screen slides from AT, focus-visible/touch-reachable controls | L | a11y A11Y-09 | `AcademicCollaborators.tsx:64-109`; `Updates.tsx:82-128` | ✅ |
| B38 | Add `focus-visible:ring` everywhere `focus:outline-none` is used | S | a11y A11Y-08 | `AdminForm.tsx:111`; `MediaLibrary.tsx:256,384,395`; `ContactEmailForm.tsx:22,28` | ≈ |
| B39 | Add Organization + BreadcrumbList structured data (JsonLd component; WebSite/MedicalStudy/Person optional) | M | launch L9 | `src/components/seo/JsonLd.tsx` (new); layout, study pages | ✅ |
| B40 | Add a default OG share image via `next/og` `ImageResponse` (`next/og` is unaffected by `images.unoptimized`) | M | launch L14 | `src/app/opengraph-image.tsx` (new) | ✅ |
| B41 | Reconcile Prisma **migration drift**: `schema.prisma` has `DeletedPublication` + the filter route/affiliation columns that are in **no migration** (applied via `db push`). Decide & document: commit to `db push`, or backfill migrations for `migrate deploy` | M | arch #11 | `prisma/migrations/*` vs `schema.prisma:188,206-226` | ✅ |
| B42 | Server-render the fetch-on-mount client sections (`RecentPublications`, `PublicationIndex`, `StudiesOverview`, `JoinStudyForm` dropdown) from `src/lib/data/*` | M | perf P3-fetch (+ arch #19) | `PublicationIndex.tsx:115`; `StudiesOverview.tsx:59`; `JoinStudyForm.tsx:44` | ≈ |
| B43 | Feed only the active-language dictionary from the server so both `en`+`zh` (~48 KB) aren't bundled on every page | M | perf P2-dict | `src/messages/{en,zh}.ts`; `layout.tsx:42` + 16 importers | ✅ |
| B44 | Set up Google Search Console: verify property, submit `sitemap.xml`, request indexing of home + key study pages | S | launch L18 | external (needs B04, B06) | ext |

### 🟡 Low (B45–B63) — grouped; nothing dropped

| ID | Task | Eff | Source | Files | ✓ |
|---|---|---|---|---|---|
| B45 | Split the two ~1000-line files: `admin/publications/page.tsx` (1041) and **Navbar** (1003, → server chrome + client island) — dedupe Navbar search into a hook | L | perf P1b + debt DEBT-5 + arch #17 | `admin/publications/page.tsx`; `src/components/layout/Navbar.tsx` | ✅ |
| B46 | Delete the orphaned pre-blocks section layer (~17 dead components + their stories + the assets only they reference); **grep each before deleting** (`findAssetUsage` can't see hardcoded paths) | L | debt DEBT-2/13/19-35 + arch #7 | `src/components/sections/*` (Appendix A of debt report); `media-resolve.ts:105` | ✅ |
| B47 | Decide & document the data-access rule; migrate the 54 direct `prisma` imports toward `src/lib/data/*` (only 2 modules today) | L | debt DEBT-6 (+ arch #19) | `src/lib/data/`; 54 importers | ✅ |
| B48 | Regenerate the seed from a live DB dump (build `prisma/dump-to-seed.ts`); make the destructive `deleteMany` seed PII-safe; resolve seed TODO placeholders | L | debt DEBT-4/17 (+ arch #12) | `prisma/seed.ts:50-57,134,151-156` | ✅ |
| B49 | Broaden test coverage to the ~30 untested API routes + remaining libs (`page-draft-ops`, `translate/*`) and the thin admin e2e happy-path | L | debt DEBT-39/41-47 + arch #16 | Appendix B of debt report | ≈ |
| B50 | Decompose `PageEditor.tsx` (extract `usePageEditorApi` + `PublishBar`) | M | debt DEBT-18 | `PageEditor.tsx` (569) | ✅ |
| B51 | Collapse the 3 static study pages (`ferdinand`,`food-beverage`,`nz-synergy`) into the `[slug]` route (they already exist as DB studies) | M | debt DEBT-9 | `src/app/studies/{...}/page.tsx` | ✅ |
| B52 | Retire the `StudyContent` fallback once every study has a saved layout (tracked debt — don't delete yet) | M | debt DEBT-10 | `studies/[slug]/StudyContent.tsx` | ✅ |
| B53 | Reduced-motion: global `prefers-reduced-motion` guard + pause control on marquee/autoplay carousels; expose `DiscoverVideo` controls | M | a11y A11Y-10/11 | `globals.css:100-106`; `Updates.tsx:31-38`; `DiscoverVideo.tsx:128` | ✅ |
| B54 | a11y refinements: `<html lang="zh-Hans">`; `aria-pressed`/`aria-current` on mobile language toggle; warn on new-tab external links | S | a11y A11Y-12/13/14 | `layout.tsx:38`; `Navbar.tsx:847-857` | ✅ |
| B55 | Harden publications-sync robustness: wrap summary fetch (L1), add a transaction/re-read (L2), unique key for DOI-less works (L3), don't null a known DOI on detail-fetch fail (L4) | S–M | bugs L1-L4 | `src/lib/orcid.ts`; `publications/sync/route.ts` | ✅ |
| B56 | Log block JSON parse failures (slug + block id) instead of silently dropping from the search index | S | bugs L5 | `src/app/api/search/route.ts:90-100` | ✅ |
| B57 | Security hardening (defence-in-depth, admin-only): require MIME **and** extension on uploads (F5); trusted-proxy client IP (F7); validate ORCID id on the fetch path (F8); keep the translate API key out of any query string if that provider is enabled (F9) | S | sec F5/F7/F8/F9 | `media-upload.ts`; `contact/route.ts:35`; `orcid.ts`; `translate/provider.ts:80` | ✅ |
| B58 | Clear the residual `npm audit` noise: patch the vitest stack (dev-only) and refresh the lockfile for `postcss`/`brace-expansion` — **no `package.json` change, and never `npm audit fix --force`** | S | deps DEPS-2/3 + sec F10 | lockfile | ≈ |
| B59 | Record the Node pin in-repo: `.nvmrc` = `22.17.1` + permissive `engines: { node: ">=22.17.1" }` (a floor, not an exact pin); widen `@types/node` `^20`→`^22` | S | deps DEPS-4/5/6 | `.nvmrc` (new); `package.json` | ✅ |
| B60 | Remove the dead `prisma.seed` package.json key; wire (or drop) `@vitest/coverage-v8`; drop `@storybook/addon-onboarding` | S | deps DEPS-7/8 + debt DEBT-14 | `package.json`; `vitest.config.ts` | ✅ |
| B61 | Incremental strictness, **one flag per PR** (each surfaces real errors): `noUncheckedIndexedAccess` etc. (tsconfig); type-aware ESLint; bring Storybook a11y into the gate | M | deps DEPS-9/10 + debt DEBT-8 | `tsconfig.json`; `eslint.config.mjs` | ≈ |
| B62 | Repo hygiene: delete committed dead assets (`zzz/` = 35 PNGs, `top-screenshot.png`); move colocated `*.test.ts` out of `src/app/api/test/`; label one-shot `prisma/*.ts` scripts in docs; review the lone exhaustive-deps suppression; fix the homepage CTA default drift; remove the `BlockRenderer` `ourPartners` case (mind merge order) | S | debt DEBT-7/11/12/15/16/48 | `zzz/`, `top-screenshot.png`; `HomepageHero.tsx:16`; `BlockRenderer.tsx:308` | ✅ |
| B63 | Deferred/contextual: commit Linux visual-regression baselines (`-linux.png`); detect & report broken media rows before pruning (verify vs live DB); audit for hardcoded-English/untranslated block fields (never overwrite native ZH); document the single-shared-password auth trade-off; (optional) cache shared render-path reads + `cache()` the double study read; re-enable CI if org billing is restored | S–M | arch #13/#9/#20/#2 + perf P4-cache/study2x + arch #10 | `e2e/*-snapshots/`; `media-resolve.ts`; `docs/` | ✅ |

---

## Proposed split: next sprint vs post-launch

**Rule:** with no CI and merge-to-`main` = prod, *next sprint* = everything that must be
true for a safe public launch **plus** small high-leverage security/correctness/perf/a11y
wins. *Post-launch* = large refactors (land **tests-first**), polish, and nice-to-haves.

### ✅ Next sprint (pre-launch)

- **Launch go-live:** B01–B13 (build-time `SITE_URL`, metadataBase + canonical + sitemap,
  OG/Twitter, robots `Sitemap:`, 404/500, `.onrender.com`→domain 301, Resend domain,
  custom domain, strong secrets, title brand, the launch-day `ALLOW_INDEXING` flip),
  plus **B32** (favicon/manifest/theme-color — a launch without these looks unfinished)
  and **B44** (Search Console, launch day).
- **Security front-door:** B14 (order crash), B15 (Next bump), B16 (login rate-limit),
  B17 (kill `/api/test/*`), B18 (headers), B19 (search rate-limit).
- **a11y-critical on core flows:** B20, B21, B22, B23 *(B23 staged: do the "warn + no
  silent empty alt" part now)*, B34 (skip link).
- **Perf P1 (every page / 512 MB):** B24 (fonts), B25 (Navbar double-search), B26
  (homepage publications), B27 (image weight), B28 (marquee).
- **Cheap correctness + insurance:** B29, B30, B31, and **B33** (the 5 critical-path tests).

### 🕓 Post-launch

- **Large refactors (tests-first):** B45 (split god-components), B46 (delete dead section
  layer), B47 (data-layer adoption), B48 (seed-from-reality), B49 (broaden test coverage),
  B50 (PageEditor), B51 (study-slug consolidation), B52 (retire StudyContent).
- **a11y depth:** B36, B37, B38, B53, B54.
- **SEO depth:** B39 (structured data), B40 (OG image), plus hreflang/URL-locale
  (launch L15/L16 — recommend-don't-block).
- **Perf depth:** B42 (server-render sections), B43 (per-language dict), and the optional
  caching in B63.
- **Bugs (low):** B55, B56. **Security (defence-in-depth):** B57.
- **Deps/tooling/hygiene:** B58, B59, B60, B61, B62.
- **Deploy/process/context:** B41 (migration drift — do before any `migrate deploy`),
  B63 (Linux baselines, broken-media detect, i18n sweep, auth-model doc, CI re-enable).

---

## De-duplication notes (which originals merged)

| Backlog | Merged from |
|---|---|
| B04 | launch L3 + debt DEBT-9 (the slug dedup) |
| B14 | bugs H1 + arch #8 (order-overflow guard) |
| B15 | security F2 + deps DEPS-1 (the *one* prod-facing advisory) |
| B17 | security F6 + debt DEBT-3 + arch #1 (`/api/test/*`) |
| B23 | a11y A11Y-01 + A11Y-14 (placeholder-as-label) |
| B33 / B49 | debt DEBT-1/10-tests/DEBT-36-47 + arch #10/#14/#16 (CI is org-blocked → the actionable part is *tests + the `verify` gate*) |
| B35 | a11y A11Y-07 + arch #15 (admin a11y) |
| B45 | perf P1b + debt DEBT-5(Navbar) + arch #4/#17 |
| B46 | debt DEBT-2 + DEBT-13 + DEBT-19…35 + arch #7 |
| B47 / B42 | debt DEBT-6 + arch #19 (self-fetch — read path already largely on the data layer) |
| B57 | security F5/F7/F8/F9 |
| B58 | security F10 + deps DEPS-2/3 |
| B63 | arch #2/#9/#10/#13/#20 + perf P4-cache/P4-study2x |

## Verified-resolved since the audits — do **not** re-open

| Was | Now | Evidence |
|---|---|---|
| arch #5 — deleted publications resurrect on re-sync | **Fixed** | `model DeletedPublication` (`schema.prisma:188`); sync consults it (`publications/sync/route.ts`) |
| arch #6 — auto-approval too loose | **Fixed** | `DEFAULT_ROUTES` is affiliation-only — only `unitAffiliation→Approved`, all else `Pending` (`publication-filter.ts:178`) |
| arch #15 — admin a11y not audited | **Done** | covered by the a11y audit (B35, B21, B38) |
| arch #18 — *suspected* admin N+1 | **False alarm** | perf audit verified: stats use `Promise.all` counts, lists use `groupBy`/`_count` |
| arch #19 — self-fetch coupling | **Largely resolved** | server components now read `src/lib/data/*` directly; residue tracked in B42/B47 |
| arch #20 — `MailingListSignup`→`/api/mailing-list`, `/case-studies` stub dead-ends | **Gone** | the component/string exists nowhere in `src/`; no public `case-studies` page exists |

## Verified false-positives — do **not** re-raise

- **`.env` committed with secrets** — only `.env.example` (placeholders) is tracked; `.env` is gitignored.
- **Stored XSS in study prose / search snippets** — sanitized (`sanitizeBlockContent` before the sink) and React-escaped; `sanitize.ts` allow-list is tight (no script/style/img/iframe).
- **Contact `replyTo` CRLF/header injection** — `isValidEmail` rejects CR/LF; Resend uses structured params.
- **Raw SQL injection** — none; no `$queryRaw`/`$executeRaw`/`*Unsafe` anywhere.
- **The 4 "critical" `npm audit` advisories** — all one Vitest *browser-mode* advisory: dev/test-only, never in the prod runtime or the `api` gate. The 5 "Prisma" advisories are the dev-CLI chain (`prisma → @prisma/dev → hono/fast-uri`), not reachable by `@prisma/client` + the better-sqlite3 adapter in prod.
- **bug-hunt discarded candidates** — case-studies "wrong-row delete" (Prisma 7 throws on a float Int → it's a 500-vs-400, now B29); contact-email "masked as success" (intended, save ≠ email); reorder concurrency (txn-guarded); missing-ZH "returns English" (intended fallback); "sync deletes on upstream-down" (the sync has **no** delete path).

## Leave as-is — do **NOT** "fix" (intentional decisions)

- **`ALLOW_INDEXING` no-index gate** (`robots.ts` deny-all + site-wide `noindex`) — deliberate; it is flipped exactly once on launch day (B13), not removed.
- **`images: { unoptimized: true }`** — re-enabling the optimizer **OOMs at 512 MB**. Keep it off; `next/og` is unaffected.
- **`force-dynamic` → `revalidate`/ISR** — unsafe: every page reads the `lang` cookie, which forces dynamic rendering anyway, and one cached output would serve one language to both audiences. The only safe lever is data-layer caching.
- **`npm audit fix --force`** — proposes downgrading **Prisma to v6**. Never run it; apply targeted bumps instead.
- **Single shared-password admin** — accepted for a capstone; document the trade-off (B63), don't re-architect.
- **`registry.ts` (680 lines)** — large but pure data; intentionally not on the oversized-file list.

## Source reports & PRs

| Report | PR | Branch |
|---|---|---|
| `docs/reports/security-audit.md` | [#173](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/173) | `audit/security` |
| `docs/reports/bug-hunt.md` | [#169](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/169) | `audit/bugs` |
| `docs/reports/tech-debt-audit.md` | [#171](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/171) | `audit/debt` |
| `docs/reports/deps-audit.md` | [#172](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/172) | `audit/deps` |
| `docs/reports/performance-audit.md` | [#170](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/170) | `audit/perf` |
| `docs/reports/a11y-audit.md` | [#174](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/174) | `audit/a11y` |
| `docs/reports/launch-readiness.md` | [#175](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pull/175) | `audit/launch` |
| `docs/reports/architecture-audit.md` (parent, on `main`) | — | — |

*This is a triage/planning document. Each item should still be confirmed against the
code at implementation time and landed in its own PR behind `npm run verify` — never
merged straight to `main`.*
