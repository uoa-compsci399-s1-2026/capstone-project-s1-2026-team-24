# Performance Audit

*Performance review of the HNU Auckland site (Next.js 16 · React 19 · Prisma 7 / better-sqlite3 · Tailwind v4), scoped to its **actual host: a single 512 MB Render Starter instance**. Produced 2026-06-04. Read-only analysis — **no behavioural changes**. This is the deep-dive follow-up to [`architecture-audit.md`](./architecture-audit.md) §17–19 (Navbar god-component, blanket `force-dynamic` + suspected admin N+1, self-fetch coupling): same findings re-checked against the code with `file:line`, fix sketches, and a user-impact ranking.*

## 1. Method & how to read this

Audited as a lead + four parallel workstreams — **(a)** data access & N+1, **(b)** caching / `force-dynamic`, **(c)** client bundle & component boundaries, **(d)** assets & per-request memory — then **every finding was re-verified against the source** before landing here. Where a workstream's first pass was wrong, the corrected position is marked ⚠️.

Findings are ranked **by user impact on this host**, not by tidiness. Severity: 🔴 high · 🟠 medium · 🟡 low. Nothing here is implemented — each item is a sketch for a later PR.

## 2. Three host facts that drive the ranking

These reframe what "slow" means on a 512 MB single instance, and they correct the instinct that `force-dynamic` is the headline problem:

1. **better-sqlite3 reads are in-process and synchronous** — microseconds, no network hop, no pool. So "every `force-dynamic` request re-reads SQLite" is *true but cheap per read*. The dominant costs at 512 MB are **(i) bytes shipped to every visitor** (JS, fonts, images) and **(ii) per-request RAM under concurrency** — not DB round-trips.
2. **`images: { unoptimized: true }` is deliberate and correct** (the optimizer/sharp OOMs at 512 MB — see `next.config.ts:1-9`). **Do not re-enable it.** The consequence to audit instead: every image ships its **full source bytes**, so *source file size == bytes on the wire*.
3. **Every public page reads the `lang` cookie** via `getServerLang()` (`src/lib/lang.ts:17-19`), which **forces dynamic rendering**. ⚠️ This means whole-route ISR / `export const revalidate` is *not applicable* — a route that calls `cookies()` can't be statically cached, and a single cached output would serve one language to both audiences. The only safe caching lever is at the **data layer**, not the route.

## 3. Findings, ranked by user impact

### Summary

| # | Sev | Finding | Who pays | Effort |
|---|-----|---------|----------|--------|
| 1 | 🔴 | ~2.4 MB of OTF fonts site-wide, no `font-display`, redundant 2nd family | every visitor, every page | M |
| 2 | 🔴 | Navbar fires the search API **twice per keystroke**; 1002-line client component on every page | every searcher + every page | S (dedup) / L (split) |
| 3 | 🟠 | Both language dictionaries (~47 KB) bundled into the client on every page | every visitor, every page | M |
| 4 | 🔴 | Homepage downloads the **entire** publications table to show 2 cards | every homepage visit | S |
| 5 | 🟠 | Public sections fetch-on-mount (client) instead of server-rendering | studies / research / contact visitors | M |
| 6 | 🟠 | Oversized source images shipped unoptimized (705 KB *logo*, etc.) | visitors of the pages that use them | S |
| 7 | 🟠 | Partner marquee eager-loads every logo, **twice**, as bare `<img>` | homepage / collaborations visitors | S |
| 8 | 🟡 | Study-detail page reads the study row **twice** per request | study-page visitors | S |
| 9 | 🟡 | `force-dynamic` everywhere + no data caching (⚠️ low-cost here) | — (mostly a non-issue) | M (optional) |
| 10 | 🟡 | Uploads buffer whole files (≤20 MB) in memory | admins only | S |

---

### P1 — Every visitor, every page

#### 1. 🔴 ~2.4 MB of uncompressed OTF fonts ship on every page, with no `font-display`

`src/app/globals.css:3-29` declares four `@font-face` rules pointing at **`.otf`** files, and `body { font-family: "Inter" }` (`:62`) makes Inter the site-wide body font:

| File | Size |
|------|------|
| `public/fonts/Inter-Regular.otf` | 595 KB |
| `public/fonts/Inter-Italic.otf` | 576 KB |
| `public/fonts/Inter-Medium.otf` | 613 KB |
| `public/fonts/Inter-Bold.otf` | 617 KB |

A typical content page uses all four weights (body 400, italics, `font-medium`, `font-bold`), so **~2.4 MB of fonts download per fresh visit**. Two compounding problems:

- **OTF, not WOFF2.** WOFF2 is Brotli-compressed and typically **~70 % smaller**; OTF is near-uncompressed. This is the single biggest page-weight win available.
- **No `font-display`.** The default (`auto` → effectively `block`) hides text (FOIT) until the font arrives — directly delaying first contentful paint on slow connections, on *every* page.

⚠️ **Redundant second family.** `src/app/layout.tsx:7-15` *also* loads **Geist + Geist Mono** via `next/font/google` (which self-hosts them and adds `swap`), and `globals.css:48-49` maps Tailwind's `font-sans`/`font-mono` to Geist. So the page can pull **both** Inter (body) and Geist (`font-sans` utility) — two families, one of them largely redundant. Ironically the *well-configured* font (Geist, via `next/font`) is overridden by the *poorly-configured* one (manual Inter `@font-face`, no swap, OTF).

**Fix sketch:** Convert Inter to **WOFF2** and load it via **`next/font/local`** (gets `font-display: swap`, preload, self-hosting for free) — *or* drop Inter and standardise on the already-optimal Geist. Either way, remove the unused family. Expected: **~2.4 MB → ~300–500 KB** on every page, plus faster text paint.

#### 2. 🔴 Navbar fires the search API twice per keystroke, and is a 1002-line client component on every page

`src/components/layout/Navbar.tsx` is `"use client"` (`:1`) and imported by **all 13 public pages** (home, about, team, research, studies + 3 study pages, collaborations ×4, contact). It legitimately needs the client (scroll listener, mobile menu, focus trap, live search) — but it carries **duplicated effects**:

- **Two near-identical debounced-search effects**, both keyed `[searchQuery]`: `:136-180` **and** `:192-222`. Both run on every keystroke, so each keystroke fires **two** `GET /api/search` requests.
- **Two identical "reset on close" effects**, both keyed `[searchOpen]`: `:124-132` **and** `:182-190`.

The duplicated search is the costly one: each `/api/search` call runs a 4-table union plus block-content flattening (`src/app/api/search/route.ts`). On a **single** 512 MB instance, a few people typing in the search box doubles that load for no reason — and it's a latent double-fetch bug, not just dead bytes.

**Fix sketch:**
- **Quick win (S):** delete the duplicate effects (`:192-222` and `:182-190`). Halves search server load and removes the double-fetch bug. *Verify the kept copy is the intended one before deleting.*
- **Structural (L):** split the static chrome (logo, nav links, dropdown markup) into a server component and keep a small client island for the interactive parts (search dialog, mobile toggle, scroll/keyboard). Cuts client JS shipped on every page. (Tracks architecture-audit §17.)

#### 3. 🟠 Both language dictionaries ship to the client on every page

`src/messages/en.ts` (~24.8 KB) and `src/messages/zh.ts` (~22.9 KB) are imported and **selected at runtime** — `const t = lang === "EN" ? en : zh` — in **16 `"use client"` components** (19 importers total; e.g. `Navbar.tsx:10-11`, `RecentPublications.tsx:6-7`, the team/section components). Because the choice is runtime, **neither dictionary can be tree-shaken**: both languages are bundled and parsed on every public page, even though a visitor only ever sees one.

**Fix sketch:** Provide the **active-language** dictionary from the server. `LanguageProvider` already receives `initialLang` (`src/app/layout.tsx:42`) and the toggle already triggers a server refresh (`src/lib/lang.ts` header comment), so client components don't need both dicts compiled in — feed the active one through context / a `useMessages()` boundary. Ships ~half the message payload and removes ~20 KB of duplicate-language JS per page.

---

### P2 — Specific high-traffic pages

#### 4. 🔴 The homepage downloads the entire publications table to render two cards

`RecentPublications` (rendered on public pages via `BlockRenderer`) defaults to `limit = 2` (`src/components/sections/RecentPublications.tsx:22-26`) but, in a client `useEffect`, fetches **all** approved publications and slices client-side:

```ts
const res = await fetch("/api/publications", { cache: "no-store" }); // :35
const top = data.filter(p => p.year).sort(...).slice(0, limit);       // :39-42
```

And `src/app/api/publications/route.ts:6-34` has **no `take`** and `include`s the full `category` + `authors` → `teamMember` graph for *every* approved publication. So showing two cards pulls the whole publications table (with author joins) over the wire, uncached, and re-reads SQLite on every homepage hit. This scales with the publication count — exactly what an ORCID sync grows over time. The same unbounded route also backs `PublicationIndex` on `/research` (`:115`).

**Fix sketch:** Server-render `RecentPublications` via a `src/lib/data/*` call with `take: N` and a narrow `select` (title, authorsRaw, journal, year, url/doi). Add a bounded `?take=`/`recent` variant to the public route for `PublicationIndex`. Removes a client waterfall, an unbounded payload, and an uncached read from the busiest page.

#### 5. 🟠 Public content sections fetch-on-mount (client) instead of server-rendering

`RecentPublications` (`:35`), `PublicationIndex` (`:115`), `StudiesOverview` (`:59`), and `JoinStudyForm` (`:44`, for its studies dropdown) are client components that fetch public API routes in `useEffect`. Each pays triple: **(i)** content is absent from the initial HTML (worse FCP, weaker SEO), **(ii)** an extra browser→server round-trip after hydration, and **(iii)** the target routes are `force-dynamic`, so each is an uncached SQLite re-read.

**Fix sketch:** Render these on the server from `src/lib/data/*` — the exact pattern `OurPartners` and the team page already use successfully — and keep a thin client component only for genuinely interactive filtering/sorting. (`JoinStudyForm`'s `/api/contact` POST at `:82` is a real form submit and should stay client.)

---

### P3 — Page weight (images served unoptimized)

#### 6. 🟠 Oversized source assets ship as-is

Because the optimizer is off (correctly), source size *is* wire size. `public/` totals 12 MB; the worst offenders:

| File | Size | Note |
|------|------|------|
| `public/images/partners/PFR-print.jpg` | **705 KB** | a *partner logo* — should be < 50 KB |
| `public/dan-gold-…-unsplash.jpg` | 590 KB | research/home photo |
| `public/roberto-sorin-…-unsplash.jpg` | 569 KB | research/home photo |
| `public/lily-banse-…-unsplash.jpg` | 551 KB | research/home photo |
| `public/facilities.png` | 481 KB | PNG photo (JPEG/WebP would be far smaller) |
| `public/spinal-page-clipboard.png` | 404 KB | PNG |
| `public/maori-pattern.svg` | **252 KB** | huge for an SVG (likely an embedded raster / un-minified) |
| `public/images/logos/hnu-logo.svg` | **189 KB** | huge for a logo SVG |

**Fix sketch:** Recompress/resize sources offline — logos to < 50 KB, hero photos to < 200 KB, preferring WebP (the existing `homepage-hero-bowl.webp` at 167 KB is the model). Run SVGO on the two large SVGs. Pure asset swap, no code change. (Continues the downsizing work from #164.)

#### 7. 🟠 Partner marquee eager-loads every logo, twice, as bare `<img>`

`src/components/sections/OurPartners.tsx:11` duplicates the list for the scroll effect — `const items = [...partners, ...partners]` — and renders each as a bare `<img>` (`:31-43`) with **no `loading="lazy"`, no `decoding`, no width/height**. So every collaborating + industry logo (including the 705 KB `PFR-print.jpg`) is fetched eagerly and **twice**. Separately, `src/components/sections/PartnerImageGrid.tsx:70` force-eager-loads its first eight images via `priority={i < 8}`, several of which sit below the fold.

**Fix sketch:** Add `loading="lazy"` + `decoding="async"` + intrinsic `width`/`height` to the marquee `<img>`s (the wrapper already fixes display size, so this is layout-shift-safe). Drop the blanket `priority={i < 8}` in `PartnerImageGrid` and let Next's default lazy behaviour handle below-the-fold logos.

---

### P4 — Data / caching / per-request memory (modest — corrects the framing)

#### 8. 🟡 Study-detail page reads the study row twice per request

`fetchStudy(slug)` (`src/app/studies/[slug]/page.tsx:21-30`) is a plain async function — **not** wrapped in React `cache()` — and is called in both `generateMetadata` (`:34`) and the page body (`:59`). Next does not memoize raw Prisma calls across those two, so each study page does two SQLite reads. Cheap individually (host fact #1), but free to fix.

**Fix sketch:** `import { cache } from "react"` and wrap `fetchStudy` → request-level dedup, one read. One line, no behaviour change.

#### 9. 🟡 `force-dynamic` everywhere + no data caching — honestly low-cost here

All public pages carry `export const dynamic = "force-dynamic"` and nothing uses `revalidate`/`unstable_cache`. ⚠️ **Correcting the workstream's first instinct** ("switch pages to `revalidate`"): that's both unsafe and unnecessary here — the `lang` cookie forces dynamic rendering (host fact #3), and in-process SQLite reads are microseconds (host fact #1). The core render path is already efficient: one `findUnique` + `include` (`src/components/blocks/render-page.tsx:24-32`), keyed media + translation lookups.

**Fix sketch (optional, low priority):** *If* profiling ever shows the render path is hot, cache the heavier shared reads with `unstable_cache` / Next's `"use cache"` keyed by `[slug, lang]`, invalidated on publish (`src/lib/page-publish.ts` / the publish route is the natural hook). Do **not** convert pages to route-level ISR.

#### 10. 🟡 Uploads buffer whole files in memory (admin-only, bounded)

`src/app/api/admin/studies/[id]/pdfs/route.ts` buffers an entire PDF — up to `MAX_PDF_SIZE = 20 MB` (`:9`) — via `arrayBuffer()` → `Buffer.from` before `writeFile` (`:119-120`); media uploads do the same at 10 MB (`src/app/api/admin/media/route.ts:57`, `src/lib/media-upload.ts:7`). With `formData()` also buffering the body, a single 20 MB upload is held ~2× transiently. This is **admin-only** (low concurrency, few users) and **size-capped**, so user impact is negligible — noted only as the largest transient RAM spike on a 512 MB box.

**Fix sketch:** Acceptable as-is. Only if concurrent admin uploads ever OOM, stream to disk instead of buffering.

## 4. Already optimal — do NOT touch

Re-verified and healthy; flagging these so a later pass doesn't "fix" them or re-raise the old suspicions:

- **Translation cache is a keyed, O(strings-on-page) lookup**, not a table scan: `where: { targetLang, sourceHash: { in: hashes } }` over the `@@unique([targetLang, format, sourceHash])` index (`src/lib/translate/blocks.ts:196-200`). The "translation cache under load" concern is a non-issue; the read path never calls the translation API.
- **Heavy editor deps are admin-only *and* lazy-loaded** → zero public-bundle leak. `@tiptap` appears only in `RichTextField.tsx`; `@dnd-kit` only in `PageEditor` / `RowEditor` / `SortableBlock`; both are behind `next/dynamic({ ssr: false })` (`PageEditorLoader.tsx:9`, `fields.tsx:15-16`).
- **No admin N+1** (corrects architecture-audit §18's *suspicion*): dashboard stats = `Promise.all` of six `count()`s (`src/app/api/admin/stats/route.ts:13-20`); admin publications list uses `groupBy` + `select`; admin pages list uses `_count`; page render uses a single `include`.
- **Search route is bounded and SQL-pushed** (`src/app/api/search/route.ts:166-245`): each source filtered in SQL with `where` + `select` + `take` (8/8/8/6), only ≤ 6 matched pages flattened to text, final list capped at 20. The only search problem is the Navbar double-fire (#2), not this handler.
- **Self-fetch coupling (architecture-audit §19) is largely resolved** — server components read `src/lib/data/*` directly (`docs/architecture.md:35`); the remaining internal fetches are client-side and covered by #4/#5.
- **Prisma is a correct singleton** with the better-sqlite3 adapter (`src/lib/prisma.ts`); **no unused dependencies** were found; **`images: { unoptimized: true }` is correct — keep it.**

## 5. Suggested order of attack

1. **Cheapest big wins first:** delete the duplicate Navbar effects (#2 quick win), wrap `fetchStudy` in `cache()` (#8), add `loading="lazy"` to the marquee (#7) — all small, all safe.
2. **Page weight:** convert Inter to WOFF2 + `swap` and drop the redundant font family (#1); recompress the oversized images/SVGs (#6).
3. **Data on the busiest page:** bound `/api/publications` and server-render `RecentPublications` (#4), then the other fetch-on-mount sections (#5).
4. **Bundle hygiene:** ship one language dictionary (#3); follow with the structural Navbar split (#2).
5. **Leave alone:** `force-dynamic`/caching (#9, optional), upload buffering (#10), and everything in §4.

## 6. Verification

- Every `file:line` and asset size above was read/measured directly against the working tree at the commit this branch was cut from; subagent claims were independently re-checked by the lead (corrections marked ⚠️).
- No source files were modified by this audit — it is analysis-only. The repo gate **`npm run verify`** (`tsc --noEmit && eslint && vitest run --project api`) was run to confirm the docs-only change leaves the tree green (there is no CI; `verify` is the gate).
- Out of scope by design: re-enabling the image optimizer, implementing any fix, touching the live DB, and merging (merging `main` deploys production).
