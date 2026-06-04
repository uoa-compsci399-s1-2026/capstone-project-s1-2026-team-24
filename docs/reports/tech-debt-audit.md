# Tech-Debt & Architecture Audit — HNU Auckland

| | |
|---|---|
| **Date** | 2026-06-04 |
| **Branch** | `audit/debt` (cut from `origin/main`) |
| **Scope** | Whole repo — duplication, dead code/assets/deps, seeds-vs-reality, types/tests/tooling |
| **Stack** | Next.js 16.2.2 (App Router) · React 19.2.4 · Prisma 7.7 + better-sqlite3 · Tailwind v4 · Render Starter (512 MB) |
| **Constraints** | `main` = production deploy · **no CI** — `npm run verify` (`tsc --noEmit && eslint && vitest run --project api`) is the only gate |
| **Changes** | **None.** This document only *describes and proposes*. No code, config, or data was modified. |

Produced by a lead + four parallel review passes (duplication / dead-code / seeds /
types-tests). The lead independently re-verified every headline claim against the code on
`origin/main`; three subagent errors were caught and corrected (see
[§2](#2-methodology--verification) and [Appendix C](#appendix-c--corrections-log)). Every
finding cites `file:line` so it can be checked in seconds.

---

## 1. Executive summary

The codebase is **healthier than its size suggests on type-safety and structure**, but it
carries one strategic liability and a cluster of cleanup debt. The defining story: the site
was migrated to a **block-based page builder**, and that migration succeeded *at the routing
layer* — every public page now renders from the database via `renderPageBlocks(...)`. But
the **old hardcoded-section layer was never deleted**, so the repo now contains a shadow copy
of the pre-blocks site. Combined with the absence of CI on a repo where `main` deploys to
production, the two highest-leverage items are about **reducing ambiguity and adding a safety
net**, not fixing bugs.

### Leverage ranking — what most slows future work (Risk × Reach ÷ Effort)

| # | Finding | Why it slows / endangers future work | Effort | Workstream |
|---|---|---|---|---|
| **1** | **No CI + critical paths untested** — auth, HTML sanitisation, safe-URL, rate-limit, draft-discard have zero tests, and the only gate is run manually | On a repo where merge-to-`main` deploys prod, a regression in auth or sanitisation **ships silently**. This is the safety net for *all* future work. | M | D |
| **2** | **Orphaned pre-blocks section layer** — ~17 dead components (+ their assets) sit beside the ~17 live ones in `src/components/sections/` | A developer can't tell live from dead by looking; high risk of editing the **wrong (dead) copy** and being confused when nothing changes. | S | A/B |
| **3** | **Unauthenticated `/api/test/*` routes in production** — a DB-count endpoint and an outbound-ORCID endpoint, both public | Free resource/abuse vector on a 512 MB box; the ORCID one proxies an unauthenticated outbound call. | XS | B |
| **4** | **Seeds ≠ reality, and there is no committed DB baseline** — fresh clones get an empty DB seeded from a stale, partial snapshot | local ≠ prod → onboarding is slow and bugs reproduce differently than they do live. | M | C |
| **5** | **Two ~1000-line files** — `admin/publications/page.tsx` (1041) and `Navbar.tsx` (1002, with duplicated search logic) | These are hot-edit areas; their size makes every change slow and merge-conflict-prone. | M | D |
| **6** | **Half-adopted data layer** — `src/lib/data/` has 2 files, but 54 files import `prisma` directly, including pages and render components | No clear answer to "where does data access belong?", so each new feature re-decides. | M | D |
| **7** | **Committed dead assets** — `zzz/` (35 tracked screenshots) and `top-screenshot.png` | Repo bloat and noise; clones and reviews carry junk. | XS | B |
| **8** | **Tooling polish** — `noUncheckedIndexedAccess` off; Storybook outside the gate; one content-default drift | Minor latent-bug surface and config drift. | S | D |

**Recommended first moves (all low-risk):** delete/guard the `/api/test/*` routes (#3),
remove the dead section layer and `zzz/`/`top-screenshot.png` (#2, #7), then add a CI
workflow that runs `npm run verify` on PRs and start landing the 10 tests in
[§6](#6-workstream-d--types-tests-tooling) (#1). Items #4–#6 are structural follow-ups.

---

## 2. Methodology & verification

Four parallel review passes mapped the four workstreams; the lead then re-derived every
headline claim from source. **Re-verification mattered** — three confident subagent
conclusions were wrong, and each correction changes a priority:

1. **`prisma/dev.db` is *not* committed.** It is `.gitignore`d (`/.gitignore` lists both
   `prisma/dev.db` and `dev.db`) and `git ls-files prisma/dev.db` returns nothing. → A fresh
   clone has **no database at all** until `prisma db push` + `npm run seed` run, which
   *raises* the seed gap's importance (it is the only path to local data).
2. **`zzz/` and `top-screenshot.png` *are* committed.** `git ls-files zzz/` lists 35 files,
   and `top-screenshot.png` is tracked (it predates the `/*.png` ignore rule, so the rule
   doesn't untrack it). → Real, removable bloat, not a local-only scratch dir.
3. **`HomepageStudies.tsx` is dead.** `BlockRenderer.tsx:26` imports `HomepageStudiesBlock`
   (the block), **not** the hardcoded section; the section is referenced only by its
   `.stories.tsx`. The "fully-migrated, healthy" framing also undersold the orphaned-layer
   debt below.

The `/api/test/*` routes ([§4](#4-workstream-b--dead-code-assets-deps-routes)), the
destructive seed, and the data-access spread were verified first-hand.

---

## 3. Workstream A — Duplication map (hardcoded sections vs page-builder blocks)

### 3.1 The shape of the system

Every public page is a thin shell that renders blocks from the DB. Verified call sites of
`renderPageBlocks(...)`:

| Page | Call site | Slug |
|---|---|---|
| Home | `src/app/page.tsx:26` | `home` |
| About | `src/app/about/page.tsx:28` | `about` |
| Research | `src/app/research/page.tsx:28` | `research` |
| Studies | `src/app/studies/page.tsx:28` | `studies` |
| Team | `src/app/team/page.tsx:28` | `team` |
| Collaborations | `src/app/collaborations/page.tsx:28` | `collaborations` |
| Collaborations / Academic | `src/app/collaborations/academic/page.tsx:28` | `collaborations-academic` |
| Collaborations / Industry | `src/app/collaborations/industry/page.tsx:28` | `collaborations-industry` |
| Contact | `src/app/contact/page.tsx:27` | `contact` |
| Admin preview | `src/app/admin/preview/[slug]/page.tsx:20` | (draft) |

`src/components/blocks/BlockRenderer.tsx` is the dispatcher. It imports and renders **~17
live section components** (`BlockRenderer.tsx:3-27`), e.g. `HomepageHero`, `Updates`
(`:212`), `CollaborationsIntro` (`:247`), `StudiesOverview` (`:267`), `TrialDesign`
(`:268`), `DiscoverVideo` (`:279`), `RecentPublications` (`:306`), `OurPartners` (`:311`),
`AcademicCollaborators` (`:315`), `IndustryCollaborators` (`:326`). These section components
are **not** dead — they are the rendering bodies for blocks.

### 3.2 Double-implementations that are now DEAD — *the block copy wins*

These hardcoded sections were superseded by blocks but never removed. None has a live import
(only their own definition, and in one case a Storybook story):

| Hardcoded section (dead) | Live replacement | Winner |
|---|---|---|
| `sections/HomepageStudies.tsx:8-25` (NZ Synergy + Food&Beverage cards, hardcoded) | `blocks/HomepageStudiesBlock.tsx` via `BlockRenderer.tsx:197-202`, registry `homepageStudies` | **Block** |
| `sections/DiscoverHero.tsx` | `blocks/SubpageHeroBlock.tsx`, registry `discoverHero` (`registry.ts:132-144`) | **Block** |
| `sections/ResearchHero.tsx` | registry `researchHero` (`registry.ts:145-157`) | **Block** |
| `sections/ContactHero.tsx` | registry `contactHero` (`registry.ts:171-182`) | **Block** |
| `sections/CollaborationsHero.tsx` | registry `subpageHero` (`registry.ts:191-212`) | **Block** |

> `HomepageStudies.tsx` is kept alive only by `sections/HomepageStudies.stories.tsx` —
> remove the story alongside the component.

Beyond the heroes, an entire generation of page-body sections is orphaned (full list in
[Appendix A](#appendix-a--dead-component-inventory)): `DiscoverWhoAreWe`,
`DiscoverCapabilities`, `DiscoverFacilities`, `DiscoverServicesExpertise`, `HomepageAboutUs`,
`ResearchFocus`, `ResearchIntroduction`, `CollaborationsBody`, `JoinStudyForm`,
`PostureMaintenanceCallout`, `StudyIndex`, plus `layout/PageLayout.tsx`. **Recommendation:
delete the whole dead layer** after a final per-file `grep` (proposed cleanup, not done here).

### 3.3 Static vs dynamic study pages — *dynamic `[slug]` wins*

Three hand-built static routes duplicate the dynamic study route's "resolve a saved layout,
else fall back" logic:

- `src/app/studies/ferdinand/page.tsx`, `src/app/studies/food-beverage/page.tsx`,
  `src/app/studies/nz-synergy/page.tsx` (static — take Next.js routing precedence)
- `src/app/studies/[slug]/page.tsx` + `src/app/studies/[slug]/StudyContent.tsx` (dynamic)

Both paths funnel through `src/components/blocks/study/resolve-study-layout.ts`. The three
slugs already exist as DB studies, so the static files are redundant.
**Recommendation: collapse the three static pages into the `[slug]` route.**

### 3.4 `StudyContent.tsx` vs `StudyBlocks.tsx` — *blocks win, fallback retires later*

The same study UI exists twice: `src/app/studies/[slug]/StudyContent.tsx` (281-line monolith)
and `src/components/blocks/study/StudyBlocks.tsx` (334 lines of per-block renderers).
`StudyContent` is the **no-saved-layout fallback**; `StudyBlocks` renders the admin-editable
layout. This duplication is *intentional today* but should be retired (delete `StudyContent`)
once every study has a saved layout — track it so it doesn't linger like the §3.2 layer did.

### 3.5 Content defaults — mostly de-duplicated, one drift

Block defaults are correctly centralised: `src/lib/blocks/collaborations-content.ts` is the
single source for the collaborations sections, and `src/lib/blocks/default-content.ts` for
`DiscoverVideo`/`TrialDesign`. **One real drift:** the homepage CTA default is `"/contact"`
in the component (`src/components/sections/HomepageHero.tsx:16`) but `"/studies"` in the
registry/seed (`src/lib/blocks/registry.ts:126`). The block value wins at runtime, so the
component default is dead-but-misleading — align them.

---

## 4. Workstream B — Dead code / assets / deps / routes

### 4.1 Ship-to-prod risk: unauthenticated `/api/test/*` routes

`src/middleware.ts:44-46` only matches `/admin/:path*` and `/api/admin/:path*`, so the test
routes are **publicly reachable in production**:

- **`src/app/api/test/prisma/route.ts:4-13`** — `GET` runs `prisma.study.count()` and returns
  it. No auth, no `NODE_ENV` guard. A reachable DB-touching endpoint.
- **`src/app/api/test/orcid/route.ts:4-14`** — `GET` calls `fetchNormalizedOrcidWorks(...)`
  with a hardcoded ORCID id on every hit. No auth, no guard — an **unauthenticated outbound
  request amplifier**, which matters on a 512 MB instance.

**Recommendation: delete both** (or, if kept for diagnostics, gate behind `NODE_ENV !==
"production"` *and* the admin session). They have no tests depending on them — the
co-located `*.test.ts` files are Vitest suites, not consumers of these handlers.

> Aside: 19 Vitest `*.test.ts` files live *inside the App Router tree* under
> `src/app/api/test/`. Next.js only routes `route.ts`/`page.tsx`, so they don't become
> endpoints, but co-locating tests in `app/` is unusual and invites exactly the confusion
> above. Consider moving them to a top-level `tests/` dir.

### 4.2 Dead components (~17) — proposed deletes

Verified unused at audit time (each appears only at its own definition / story — see
[Appendix A](#appendix-a--dead-component-inventory) for the evidence). They are a maintenance
tax (they still type-check, lint, and bundle) and the chief source of "which file is live?"
confusion. **Re-`grep` each immediately before deleting**, since the report changes no code.

### 4.3 Committed dead assets

- **`zzz/` — 35 tracked PNG screenshots** (`git ls-files zzz/` → 35). Working scratch that
  was committed. `git rm -r zzz/`.
- **`top-screenshot.png`** (root, ~86 KB) — tracked despite the `/*.png` ignore rule. `git rm`.
- **Assets referenced only by dead components** (verify per-file before removal):
  `public/spinal-page-clipboard.png` (`PostureMaintenanceCallout`), `public/facilities.png`
  (`DiscoverFacilities`), `public/Our Research.jpg` (`DiscoverCapabilities`). **Keep**
  `public/services-and-expertise.jpg` — it is also a study-layout fallback image.

### 4.4 Dependencies

All `package.json` runtime deps are in use (`@dnd-kit/*` in the page editor, `jose` in
`src/lib/admin-session.ts`, `resend` in `src/lib/email.ts`, `sanitize-html` in
`src/lib/sanitize.ts`, `image-size` in `src/lib/image-dimensions.ts`, Tiptap in
`RichTextField.tsx`). **Storybook** (5 stories) is configured but **not in the `verify`
gate**; `@storybook/addon-onboarding` is the new-user demo addon and is safe to drop.
devDependencies don't ship, so this is hygiene, not runtime weight.

### 4.5 One-off scripts

The `prisma/*.ts` maintenance scripts (`warm-translations`, `migrate-blocks-richtext`,
`catalog-public-media`, `backfill-media-dimensions`, `backfill-published`) are idempotent and
optional. Keep them, but label them as one-shot/maintenance in `docs/database.md` so they
aren't mistaken for required setup steps.

---

## 5. Workstream C — Seeds vs reality (and how to close the gap)

### 5.1 The gap

There is **no committed database** (see [§2](#2-methodology--verification), correction #1), so
a fresh clone's only local content comes from the seed — which is a **stale, partial,
hand-written snapshot**. `prisma/seed.ts:50-57` is **destructive**: it `deleteMany()`s eight
tables on every run (local edits are wiped). `prisma/seed-page-blocks.ts` is idempotent unless
`RESEED_PAGES=1`.

### 5.2 Model coverage (17 models)

| Coverage | Models | Notes |
|---|---|---|
| **Full** (3) | `ContactRecipient`, `PublicationCategory`, `PublicationFilterSetting` | Small, enum-like, stable |
| **Partial / drifts** (7) | `Study` (3 hardcoded, `seed.ts:59`), `TeamMember` (13, `seed.ts:160-299`), `PartnerLogo` (19, `seed.ts:27-47`), `Publication` (3 `SEED` test rows), `PublicationAuthor`, `Page` (8), `PageBlock` (~60, `seed-page-blocks.ts`) | Hand-maintained → drifts from prod whenever staff/partners/copy change |
| **Zero** (7) | `StudyPdf`, `CaseStudy`, **`ContactSubmission` (PII)**, `DeletedPublication`, `PageRevision`, `TranslationCache` (mostly), `MediaAsset` | Admin/runtime-created; not reasonably hand-seedable |

Runtime-only data that a hand seed can never capture: **Publications** (synced from
ORCID/OpenAlex via `src/app/api/admin/publications/sync/route.ts`), **TranslationCache**
(`npm run warm:translations`), **MediaAsset** (`npm run catalog:media` scans `/public`),
**ContactSubmission** (user PII), and **DeletedPublication** tombstones.

### 5.3 Proposal: regenerate the seed *from a live DB dump*

Make local match prod by generating the seed from a production export, not by hand. Sketch of
a new `prisma/dump-to-seed.ts`:

1. Point `DATABASE_URL` at a **copy** of the live SQLite file (read-only).
2. Export rows **in FK-dependency order** → emit deterministic TypeScript constants (or a
   data JSON the existing seed imports). Keep `seed.ts` thin: it should `createMany` from
   generated data, not embed literals.
3. **PII hard-stop:** never export `ContactSubmission` or `/api/admin/contacts` data. Add an
   assertion that fails the dump if those tables are touched.
4. **Page blocks:** serialise `PageBlock.content` JSON verbatim; reuse the existing
   `seedPageBlocks(...)` upsert + revision-snapshot path.
5. **Media:** export `MediaAsset` metadata *and verify each `filePath` exists under
   `/public`* (fail loudly on missing files) — `catalog:media` can remain the fallback.
6. **Optional:** include `TranslationCache` (so 中文 isn't cold) and `DeletedPublication` (so
   the next sync doesn't resurrect deleted works).
7. Document the refresh cadence in `docs/database.md` (e.g. regenerate when studies/team/
   partners/home copy change materially).

This turns onboarding from "run setup, then notice the site looks nothing like prod" into a
single faithful seed, and gives every contributor a realistic local dataset.

---

## 6. Workstream D — Types, tests, tooling

### 6.1 Type safety — a genuine strength

- **No explicit `any`**, and **no `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`** anywhere
  in `src/`. `strict: true` is on (`tsconfig.json:7`). The only suppression is one justified
  `// eslint-disable-next-line @next/next/no-img-element` (`src/components/admin/page-editor/fields.tsx:47`).
- **Gap:** `noUncheckedIndexedAccess` is **not** set (`tsconfig.json:2-24`). Turning it on
  would catch a class of array/record-index bugs, especially around the untrusted block-content
  JSON that `BlockRenderer.tsx` coerces. Expect a modest one-time fix-up.

### 6.2 TODO / FIXME inventory

Low-risk and all in seed/placeholder or planned-removal territory:
`src/components/blocks/BlockRenderer.tsx:308` (remove `ourPartners` case once the
carousel-deletion PR lands — note the merge-order caveat in the comment),
`prisma/seed.ts:134` (`redcapUrl: "TODO_REAL_REDCAP_URL"`), `prisma/seed.ts:151-156`
(`TODO_*@auckland.ac.nz` recipient emails). No `FIXME`/`HACK`/`XXX` found in `src/`.

### 6.3 Oversized files & decomposition seams

| File | Lines | Why it's large | Proposed split |
|---|---|---|---|
| `src/app/admin/publications/page.tsx` | 1041 | Listing + sync summary + filter-settings panel + ~4 helper components in one client file | `PublicationsTable`, `SyncSummary`, `FilterSettingsPanel`, `RouteRuleRow` under `components/admin/publications/` |
| `src/components/layout/Navbar.tsx` | 1002 | Desktop+mobile nav + dropdowns + **live search (debounce logic appears twice)** + language toggle | Extract `NavbarSearch` + a `useNavbarSearch` hook (deduplicate); consider native `<dialog>` for the search overlay |
| `src/lib/blocks/registry.ts` | 680 | Pure block metadata/defaults | **Leave as-is** — it's data, and keeping it unified is correct |
| `src/components/admin/page-editor/PageEditor.tsx` | 569 | State + ~10 async CRUD/publish/revision handlers + split-pane JSX | Extract a `usePageEditorApi` hook and a `PublishBar` component |

### 6.4 Architectural inconsistency: half-adopted data layer

`src/lib/data/` is meant to be the data-access layer but contains only two files
(`team.ts`, `partner-logos.ts`). Meanwhile **54 files import `prisma` directly**. For API
route handlers that's the norm. The inconsistency is in **pages and render components**
reaching into Prisma directly, bypassing the nascent layer:

- Pages: `src/app/admin/pages/page.tsx`, `src/app/admin/pages/[slug]/page.tsx`,
  `src/app/studies/[slug]/page.tsx`, `src/app/admin/studies/[id]/layout/page.tsx`,
  `src/app/admin/studies/template/page.tsx`
- Render components / helpers: `src/components/blocks/render-page.tsx`,
  `src/components/blocks/study/resolve-study-layout.ts`

**Recommendation:** decide the rule ("pages/components call `src/lib/data/*`; only the data
layer and API routes touch `prisma`") and migrate these incrementally. Even just documenting
the rule in `docs/architecture.md` removes the per-feature re-decision cost.

### 6.5 Test coverage map

The gate runs **only the `api` Vitest project** (`vitest.config.ts:30`,
`include: ['src/app/api/test/**/*.test.ts']`); the `storybook` browser project and Playwright
e2e are **not** in `npm run verify`. There are 17 API test files. Strong spots:
`publication-filter.test.ts` (extensive), `publications-sync.test.ts`, `page-publish.test.ts`,
`search.test.ts`. **Untested critical surface:**

- **Routes (~30 with no test)** — incl. `/api/admin/auth/login` & `/logout`,
  `/api/admin/case-studies`, `/api/admin/contacts`, `/api/admin/stats`, `/api/studies/[slug]`,
  `/api/publications`, `/api/admin/study-layouts/[slug]` (PATCH), `/api/admin/media/[id]/replace`,
  `/api/admin/pages/[slug]/blocks/[id]/duplicate`, `/api/admin/pages/[slug]` (PATCH). Full list
  in [Appendix B](#appendix-b--untested-api-routes).
- **Libraries with no test** — `src/lib/admin-session.ts`, `src/lib/safe-url.ts`,
  `src/lib/sanitize.ts`, `src/lib/rate-limit.ts`, `src/lib/page-draft-ops.ts`,
  `src/lib/translate/*`.

### 6.6 The 10 highest-value tests to add (given there is no CI)

Ranked by (risk if broken) × (reach) ÷ (effort). Items 1–5 are pure-function or
session-level and cheap to write; they defend the things that fail *silently* in production.

| # | Target | Assert | Why |
|---|---|---|---|
| 1 | `src/lib/admin-session.ts` (+ `/api/admin/auth/login`,`/logout`) | valid token mints/verifies; expired/garbage rejected; logout clears cookie | Gates **every** admin route; a break locks out or opens up the whole console |
| 2 | `src/lib/safe-url.ts` | `http(s)` pass; `javascript:`,`data:`,`vbscript:` rejected; null→null | XSS guard for publication/link URLs; one test covers many vectors |
| 3 | `src/lib/sanitize.ts` | scripts/handlers/iframes stripped; `rel="noopener"` added; nested rows sanitised | Block content is user-editable and renders on the **public** site |
| 4 | `src/lib/page-draft-ops.ts` (`replaceDraftBlocks`) | discard restores snapshot atomically; empty snapshot handled | The "discard changes" safety net for editors |
| 5 | `src/lib/rate-limit.ts` | allows under limit; blocks at threshold; resets after window | Contact-form spam defence |
| 6 | `/api/admin/pages/[slug]` (GET/PATCH) | metadata updates **without clobbering blocks**; 404 path | Page editor's load/save; silent data loss otherwise |
| 7 | `/api/admin/team/[id]` (PATCH/DELETE) | field updates; delete behaviour vs publication links | Team roster underpins publication attribution |
| 8 | `/api/admin/study-layouts/[slug]/reset-original` | reset restores original block order; idempotent | Study editors must trust "reset"; current tests are token |
| 9 | `/api/admin/pages/[slug]/blocks/[id]/duplicate` | new id; **deep**-copied content; correct position | Shallow copy would couple original and duplicate |
| 10 | `src/lib/translate/provider.ts` | missing key → English fallback; provider payload shape; errors caught | Misconfig silently breaks 中文 |

### 6.7 Close the loop: add CI

The single change that makes finding #1 safe is a **GitHub Actions workflow that runs
`npm run verify` (and ideally the Playwright smoke test) on every PR to `main`**. The repo
already has the gate command and an admin e2e spec (`e2e/admin.spec.ts`); today nothing runs
them automatically. (The only workflow, `.github/workflows/claude.yml`, is the Claude
assistant bot, not a build gate.)

---

## 7. Prioritised remediation roadmap

**Quick wins — low risk, do first**
1. Delete or guard `src/app/api/test/{prisma,orcid}/route.ts`. *(#3)*
2. `git rm -r zzz/` and `git rm top-screenshot.png`. *(#7)*
3. Delete the ~17 dead components ([Appendix A](#appendix-a--dead-component-inventory)) and their orphaned assets (re-`grep` each first). *(#2)*
4. Align the homepage CTA default: `HomepageHero.tsx:16` → `"/studies"`. *(#8)*

**Structural — schedule deliberately**
5. Add a CI workflow running `npm run verify` on PRs; land tests 1–5, then 6–10. *(#1)*
6. Build `prisma/dump-to-seed.ts` and regenerate the seed from a live export. *(#4)*
7. Decompose `admin/publications/page.tsx` and `Navbar.tsx` (deduplicate Navbar search). *(#5)*
8. Adopt and document the data-access rule; migrate pages/components to `src/lib/data/*`. *(#6)*
9. Collapse the three static study pages into `[slug]`; retire `StudyContent` once all studies have layouts. *(#A)*
10. Turn on `noUncheckedIndexedAccess` and fix the fallout. *(#8)*

---

## Appendix A — Dead component inventory

Each was verified unused on 2026-06-04 (appears only at its own definition, or — where noted
— a Storybook story). **Re-verify with `grep` immediately before deleting.**

| Component | Path | Only reference |
|---|---|---|
| HomepageStudies | `src/components/sections/HomepageStudies.tsx` | `HomepageStudies.stories.tsx` (delete too) |
| DiscoverHero | `src/components/sections/DiscoverHero.tsx` | self only |
| ResearchHero | `src/components/sections/ResearchHero.tsx` | self only |
| ContactHero | `src/components/sections/ContactHero.tsx` | self only |
| CollaborationsHero | `src/components/sections/CollaborationsHero.tsx` | self only |
| CollaborationsBody | `src/components/sections/CollaborationsBody.tsx` | self only |
| DiscoverWhoAreWe | `src/components/sections/DiscoverWhoAreWe.tsx` | self only |
| DiscoverCapabilities | `src/components/sections/DiscoverCapabilities.tsx` | self only |
| DiscoverFacilities | `src/components/sections/DiscoverFacilities.tsx` | self only |
| DiscoverServicesExpertise | `src/components/sections/DiscoverServicesExpertise.tsx` | self only |
| HomepageAboutUs | `src/components/sections/HomepageAboutUs.tsx` | self only |
| ResearchFocus | `src/components/sections/ResearchFocus.tsx` | self only |
| ResearchIntroduction | `src/components/sections/ResearchIntroduction.tsx` | self only |
| JoinStudyForm | `src/components/sections/JoinStudyForm.tsx` | self only |
| PostureMaintenanceCallout | `src/components/sections/PostureMaintenanceCallout.tsx` | self only |
| StudyIndex | `src/components/sections/StudyIndex.tsx` | **no references at all** — its exported name doesn't even match the filename; confirm the export name before removing |
| PageLayout | `src/components/layout/PageLayout.tsx` | self only |

> Confirmed **live** (do **not** delete): `HomepageHero`, `DiscoverVideo`, `StudiesOverview`,
> `TrialDesign`, `RecentPublications`, `OurPartners`, `PublicationIndex`,
> `AcademicCollaborators`, `IndustryCollaborators`, `BenefitsRow`, `SectionHeading`,
> `CollaborationsIntro`, `PartnerImageGrid`, `StudiesContactCard`, `StudiesContactPanel`,
> `ContactMap`, `ContactDetails`, `Updates`, and `team/*` (`BoardOfDirectors`, `ResearchTeam`,
> `AlumniSection`, `DirectorCard`, `TeamFilter`, `TeamHero`) — all reachable via
> `BlockRenderer` / `TeamSectionsBlock`.

## Appendix B — Untested API routes

No test exists (in the `api` project) for: `/api/admin/auth/login`, `/api/admin/auth/logout`,
`/api/admin/case-studies` (+ `[id]`), `/api/admin/contacts`, `/api/admin/contact-recipients`,
`/api/admin/stats`, `/api/admin/media/[id]/replace`, `/api/admin/partner-logos` (POST) &
`[id]`, `/api/admin/pages` (GET), `/api/admin/pages/[slug]` (GET/PATCH),
`/api/admin/pages/[slug]/blocks/[id]/duplicate`, `/api/admin/studies/[id]/pdfs` (+ `[pdfId]`),
`/api/admin/study-layouts/[slug]` (GET/PATCH), `/api/admin/team/[id]` (PATCH/DELETE),
`/api/case-studies`, `/api/publications`, `/api/studies/[slug]`. (Plus the two
`/api/test/*` routes, which should be deleted rather than tested.)

## Appendix C — Corrections log

| # | Subagent claim | Reality | Evidence |
|---|---|---|---|
| 1 | `prisma/dev.db` is committed (a baseline) | **Not tracked**; gitignored | `git ls-files prisma/dev.db` empty; `.gitignore` lists `prisma/dev.db`, `dev.db` |
| 2 | `zzz/` & `top-screenshot.png` are gitignored (won't ship) | **Both tracked** | `git ls-files zzz/` → 35; `top-screenshot.png` tracked despite `/*.png` |
| 3 | `HomepageStudies.tsx` is in the `BlockRenderer` import list | `BlockRenderer.tsx:26` imports `HomepageStudiesBlock`; the section is dead | grep of imports |

## Appendix D — Verification commands

```bash
# Confirm dev.db is NOT tracked, and zzz/ + top-screenshot ARE:
git ls-files prisma/dev.db          # (empty)
git ls-files zzz/ | wc -l           # 35
git ls-files top-screenshot.png     # tracked

# Confirm a dead component has no live import (repeat per Appendix A):
grep -rn "DiscoverFacilities" src/  # only its own definition

# Confirm the test routes are outside the auth matcher:
sed -n '44,46p' src/middleware.ts   # matcher: /admin/:path*, /api/admin/:path*

# Confirm the gate scope:
sed -n '23,32p' vitest.config.ts    # api project include glob
```
