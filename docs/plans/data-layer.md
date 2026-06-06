# Data-layer unification & duplication kill — implementation plan

## Context

The site was migrated to a DB-driven block page-builder, but the migration left
several liabilities the audit (`docs/reports/tech-debt-audit.md`) and backlog
(`docs/reports/MASTER-BACKLOG.md`) call out:

- **B47 / half-adopted data layer** — `src/lib/data/` is the intended data-access
  layer but only holds a handful of read accessors, while pages and render
  components reach into `@/lib/prisma` directly. "Where does data access belong?"
  is re-decided per feature.
- **B46 / orphaned pre-blocks section layer** — ~17 dead `src/components/sections/*`
  components sit beside the live ones; a dev can't tell live from dead and edits the
  wrong copy.
- **B51 / static study pages** — `ferdinand`, `food-beverage`, `nz-synergy` are
  hand-built static routes duplicating the dynamic `[slug]` route's resolve-or-fallback
  logic.
- **B52 / `StudyContent` fallback** — the no-saved-layout fallback duplicates
  `StudyBlocks`; retire it once every study resolves a layout.
- **Collaborators dedup** — `AcademicCollaborators.tsx` and `IndustryCollaborators.tsx`
  are near-identical carousels differing only in default content.

Outcome: one documented, **machine-enforced** data-access rule; a single study render
path; ~17 fewer dead files; one collaborators component — shipped as small, individually
`verify`-able PRs that never regress an intermediate state.

## Ground rules (this repo)

- **No CI.** `npm run verify` (`tsc --noEmit && eslint && vitest run --project api`) is the
  only gate. Every slice below must leave `verify` green.
- **Merging to `main` deploys production. Never push to `main`.** Each slice is its own PR;
  smoke-test on a preview/staging deploy before merge.
- **Prod DB is the source of truth; it is NOT in the repo and the seeds are stale.** Any
  "is this dead / does every study have a layout" question is answered by a **read-only
  census against a copy of the live SQLite** (or the Render shell), never by repo grep alone.
- **The gate only runs `src/app/api/test/**/*.test.ts`** (`vitest.config.ts` `api` project).
  All new tests below live there and mock Prisma with the established
  `vi.hoisted()` + `vi.mock("@/lib/prisma")` pattern (see `src/app/api/test/search.test.ts`).

## The data-access rule (decision to document in `docs/architecture.md`)

> **`@/lib/prisma` may be imported only from `src/lib/**` (the data layer + data-ish
> helpers) and `src/app/api/**` (route handlers). Pages (`src/app/**` outside `api`),
> layouts, metadata routes (`sitemap`/`manifest`/`opengraph-image`/`icon`), and
> `src/components/**` must read through `src/lib/data/*` accessors.**

This matches the audit's recommendation and bounds B47 to the **banned-zone call sites**
(8 files), not the 43 API routes:

| Banned zone (must migrate) | Read it does |
|---|---|
| `src/components/blocks/render-page.tsx` | `page.findUnique` (+ blocks) |
| `src/components/blocks/study/resolve-study-layout.ts` | `page.findUnique` ×2 (override/template), `study.findFirst` |
| `src/app/studies/[slug]/page.tsx` | `study.findFirst` (+ pdfs), wrapped in `React.cache()` |
| `src/app/sitemap.ts` | `study.findMany` |
| `src/app/admin/pages/page.tsx` | `page.findMany` (+ `_count`) |
| `src/app/admin/pages/[slug]/page.tsx` | `page.findUnique` |
| `src/app/admin/studies/[id]/layout/page.tsx` | study/page reads |
| `src/app/admin/studies/template/page.tsx` | template page reads |

Accessors follow the **`src/lib/data/team.ts` pattern**: `import "server-only"`, named
`{ prisma }` import, a `…Select as const` projection, exported `…Record`/`…Data` types,
plain async functions, errors bubble. Request-level dedup uses `React.cache()` where the
current call site does (e.g. `studies/[slug]/page.tsx`).

**Explicitly out of scope (by rule):** the 43 `src/app/api/**` handlers keep `prisma`;
existing `src/lib` data-ish helpers (`nav-studies.ts`, `site-settings.ts`,
`publication-filter-settings.ts`, `inquiry-types.ts`) are already in the allowed zone —
optionally relocate under `src/lib/data/` later, not in this story.

## Sequencing overview

| # | Slice (PR) | Item | Depends on | Risk |
|---|---|---|---|---|
| 1 | Rule doc + first safe accessors (sitemap, admin pages list) | B47 | — | Low |
| 2 | Unify collaborators + registry↔renderer parity test | dedup | — | Low–Med |
| 3 | Collapse 3 static study pages into `[slug]` | B51 | prod census | **Med–High** |
| 4 | Migrate study/page render reads onto accessors | B47 | 1, 3 | Med |
| 5 | Migrate admin editor reads onto accessors | B47 | 1 | Low |
| 6 | ESLint `no-restricted-imports` guard (enforce the rule) + N1 guard | B47 | 1,4,5 | Low |
| 7 | Delete orphaned section layer | B46 | prod census; 2,3 | Med |
| 8 | Retire `StudyContent` fallback | B52 | 3,4; prod census | **High** |

Why this order keeps every intermediate state shippable: the rule + accessors land
**additively** first (1); presentational dedup is independent (2); the study path is
**simplified before it is migrated** (3 → 4) so no work is thrown away; enforcement is the
**capstone** once the banned zone is clean (6); deletions (7) and the irreversible fallback
removal (8) come last, each behind a prod census.

---

## Slice 1 — Rule doc + first safe accessor migrations  *(B47)*

**Goal:** establish the rule and prove the accessor + test pattern on the two lowest-risk
banned-zone reads.

**Tests first (land before the refactor in the same PR):**
- `src/app/api/test/data-study.test.ts` — `listActiveStudySlugs()` issues the expected
  `where`/`select`/`orderBy` (mocked prisma); maps rows to the sitemap shape.
- `src/app/api/test/data-page.test.ts` — `listPagesWithCounts()` selects the right fields +
  `_count.blocks` + ordering.

**Changes:**
- `docs/architecture.md`: add the data-access rule above.
- New `src/lib/data/study.ts` (`listActiveStudySlugs()`) and `src/lib/data/page.ts`
  (`listPagesWithCounts()`), per `team.ts` conventions.
- `src/app/sitemap.ts` → use `listActiveStudySlugs()` (keep `export const dynamic =
  "force-dynamic"` — the #194 deploy fix).
- `src/app/admin/pages/page.tsx` → use `listPagesWithCounts()`.

**Risk:** low — sitemap is force-dynamic; admin list is admin-only.
**Rollback:** revert PR; accessors are additive, call sites restore cleanly.

## Slice 2 — Unify Academic/Industry collaborators + parity test  *(dedup)*

**Goal:** one carousel component, both block types preserved.

**Tests first:**
- `src/app/api/test/collaborators-block.test.ts` — extract a pure
  `resolveCollaboratorsProps(variant, content)` and assert academic vs industry pick the
  right defaults from `src/lib/blocks/collaborations-content.ts` (heading, cards,
  `buttonHref` `/collaborations/academic` vs `/industry`).
- `src/app/api/test/registry-render-parity.test.ts` — **every** `registry.ts` block `type`
  has a `BlockRenderer` case and vice-versa (excluding `row`). This nails the live/dead
  boundary and guards Slices 2 & 7.

**Changes:**
- New `src/components/sections/Collaborators.tsx` with `variant: "academic" | "industry"`,
  preserving the B37 carousel a11y (aria-roledescription, slide labels, off-screen hiding,
  focus-visible controls).
- `BlockRenderer.tsx`: `academicCollaborators` → `<Collaborators variant="academic" />`,
  `industryCollaborators` → `<Collaborators variant="industry" />`. **Keep both block types
  in `registry.ts`** (admins still add either).
- Delete `AcademicCollaborators.tsx`, `IndustryCollaborators.tsx` (+ any `.stories.tsx`);
  update Storybook stories to the unified component.

**Risk:** low–med (visual regression on collaborations pages). Mitigate with the unified
Storybook story + a Playwright visual check.
**Rollback:** revert PR; DB block types unchanged, so old components render again.

## Slice 3 — Collapse the 3 static study pages into `[slug]`  *(B51)*

**Prod census (ops, read-only — gate before deleting):** for each of `ferdinand`,
`food-beverage`, `nz-synergy` confirm the study exists & `isActive`, and that
`resolveStudyLayoutBlocks(slug)` resolves a layout (override **or** the shared template) —
in which case the static page already renders `StudyLayoutView` **identically** to `[slug]`.
For any slug with **no** layout, the static page shows hardcoded i18n `StudyDetail` while
`[slug]` shows DB `StudyContent` — reconcile first (populate the DB fields or add an
override) so visitor output is unchanged.

**Tests first:**
- `src/app/api/test/study-slug-resolution.test.ts` — `resolveStudyLayoutBlocks` precedence
  (override > template > null) and that `[slug]` 200s for an active study / `notFound`s
  otherwise (mocked prisma; reuse `study-layouts.test.ts` patterns).

**Changes:**
- Delete `src/app/studies/{ferdinand,food-beverage,nz-synergy}/page.tsx` — `[slug]` now
  serves them (they already exist as DB studies; B04 sitemap still lists them as active DB
  slugs).
- Delete now-orphaned `src/components/sections/StudyDetail.tsx` and its dead i18n keys
  (`ferdinand*`, `foodBeverage*`/`nzSynergy*` in `src/messages/{en,zh}`) — grep-verify no
  other referents first.

**Risk:** med–high — Next routing-precedence change + possible visitor-facing content change
if DB ≠ the old hardcoded copy. The prod census is the safety; verify on a preview deploy.
**Rollback:** `git revert` restores the static files (they reclaim routing precedence).

## Slice 4 — Migrate study/page render reads onto accessors  *(B47)*

**Goal:** finish the public render path now that it's simpler (post-B51).

**Tests first (extend Slice 1 suites):**
- `data-study.test.ts`: add `getStudyBySlug(slug)` (with `pdfs` include/order; `React.cache`
  dedups the metadata+render reads).
- `data-page.test.ts`: add `getPageWithBlocks(slug)`, `getStudyOverridePage(slug)`,
  `getStudyTemplatePage()` (visible-blocks filter, `position` order).

**Changes (behaviour-preserving — same queries):**
- `studies/[slug]/page.tsx` → `getStudyBySlug` (drop the inline `fetchStudy`/`prisma`).
- `resolve-study-layout.ts` → move its prisma reads into the accessors above; keep
  media-resolve + sanitize in the component.
- `render-page.tsx` → `getPageWithBlocks`; keep media/translation prep in the component.

**Risk:** med (main public paths). **Rollback:** revert; accessors are additive.

## Slice 5 — Migrate admin editor reads onto accessors  *(B47)*

**Tests first:** extend `data-page.test.ts`/`data-study.test.ts` for the admin-read
accessors (`getPageForAdmin(slug)`, study layout/template editor reads).
**Changes:** migrate `admin/studies/[id]/layout/page.tsx`, `admin/studies/template/page.tsx`,
`admin/pages/[slug]/page.tsx` onto `src/lib/data/*`.
**Risk:** low (admin-only). **Rollback:** revert.

## Slice 6 — Enforce the rule (capstone)  *(B47)*

**Goal:** make the migrated state regression-proof. With the banned zone clean (1,4,5), this
lands green.

**Changes:**
- `eslint.config.mjs`: `no-restricted-imports` banning `@/lib/prisma` in `src/components/**`
  and `src/app/**` **except** `src/app/api/**` (allow `src/lib/**`).
- Add the **N1** guard: flag `prisma` imports in `app/**/{sitemap,manifest,opengraph-image,
  icon}.*` lacking `export const dynamic = "force-dynamic"`.

**Test:** `eslint` (inside `verify`) is the gate — any missed banned-zone import now fails
the build (the point). **Rollback:** revert the config block.

## Slice 7 — Delete the orphaned pre-blocks section layer  *(B46)*

**Prod census (ops, read-only — gate before deleting):** `SELECT DISTINCT type FROM
PageBlock` against a live-DB copy; diff against `BlockRenderer`'s known cases. Any prod block
`type` with no renderer case is investigated **before** deleting any candidate component.
The `registry-render-parity` test (Slice 2) backs this on the repo side.

**Per-component procedure (Appendix A list, 17 files):**
1. `grep -rn ComponentName src/` → only self (+ its story).
2. Confirm no `registry.ts` type / prod `PageBlock.type` routes to it.
3. **`JoinStudyForm` carve-out (N2):** HOLD `src/components/sections/JoinStudyForm.tsx`
   from deletion until the prod census proves no block renders it. There is no
   `joinStudyForm` `BlockRenderer` case today, but per N2 do **not** delete on repo grep
   alone — keep it tracked if the census isn't run.
4. `StudyIndex.tsx`: its export name ≠ filename — confirm the export before removing.

**Tests first:** the Slice-2 `registry-render-parity.test.ts` (extended) is the structural
guard; optionally `no-dead-sections.test.ts` failing if a deleted path is re-imported.

**Changes:** delete the dead components + their `.stories.tsx` (esp.
`HomepageStudies.stories.tsx`) + assets referenced **only** by them: `public/spinal-page-
clipboard.png` (PostureMaintenanceCallout), `public/facilities.png` (DiscoverFacilities),
`public/Our Research.jpg` (DiscoverCapabilities). **KEEP** `public/services-and-expertise.jpg`
(it is also the study `[slug]` `FALLBACK_IMAGE`).

**Risk:** med (prod block types could surprise). **Rollback:** `git revert` — components are
self-contained.

## Slice 8 — Retire the `StudyContent` fallback  *(B52)*

**Prod census (ops, read-only — hard gate):** confirm **every active study resolves a
layout** — i.e. prod has a non-empty `STUDY_TEMPLATE` page (so `resolveStudyLayoutBlocks`
never returns `null`) or every active study has an override with visible blocks. Census:
count active studies whose override **and** the template both have zero visible blocks; must
be **0**. If non-zero → **HOLD deletion** (backlog: "don't delete yet"); instead populate the
shared template so all studies resolve it, then revisit.

**Tests first:** `src/app/api/test/study-fallback-retired.test.ts` — `[slug]` renders the
layout path when blocks resolve, and the null-layout case yields the chosen safe behaviour
(`notFound()`).

**Changes (only if the census passes):** delete `src/app/studies/[slug]/StudyContent.tsx`;
remove the `else <StudyContent/>` branch (and the hero/breadcrumb/`FALLBACK_IMAGE` block it
owned) from `studies/[slug]/page.tsx`, leaving the single `StudyLayoutView` path.

**Risk:** high if the gate is wrong (a layout-less study would lose its page). Census is
mandatory; this is the last slice. **Rollback:** `git revert` restores `StudyContent` + the
branch.

---

## Verification (every slice)

1. `npm run verify` green locally (tsc + eslint + `api` vitest).
2. New/extended tests in `src/app/api/test/` pass and were written **before** the refactor.
3. **Preview/staging deploy** smoke test before merge (never merge straight to `main`):
   - Slice 2: collaborations academic + industry pages render the carousel.
   - Slice 3/8: `/studies/ferdinand|food-beverage|nz-synergy` render identically pre/post
     (compare against the prod census expectation); EN + ZH.
   - Slice 6: confirm `verify` fails if a `@/lib/prisma` import is reintroduced into a view.
4. Storybook + Playwright visual baselines (B63) for the collaborators/study pages.

## Prod census commands (read-only; against a COPY of the live SQLite)

- B46: `SELECT DISTINCT type FROM PageBlock ORDER BY type;` → diff vs `BlockRenderer` cases.
- B51: per slug, check `Page` rows for `studyOverrideSlug(slug)` and `STUDY_TEMPLATE_SLUG`
  have `isVisible=1` blocks.
- B52: active studies with neither an override nor a template layout → must be 0.

Never mutate prod; use a downloaded copy or the Render shell read-only.
