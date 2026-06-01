# Architecture & Risk Audit

*Repo-wide review of the HNU Auckland site (Next.js 16 · React 19 · Prisma 7 / better-sqlite3 · Tailwind v4). Produced 2026-05-30. This is the X1 deliverable from the cloud playbook — read-only analysis, no behavioural changes. For the canonical design narrative see [`docs/architecture.md`](../architecture.md); this file adds a risk lens and a prioritised issue list.*

## 1. What the system is

One App Router project serving two surfaces from one codebase:

- **Public marketing site** — content composed from a database of editable **blocks** (`Page` → `PageBlock`), rendered server-side.
- **Admin console** (`/admin/*`) — staff edit blocks, studies, team, publications (ORCID sync), media, and read contact submissions. Gated by a single shared password behind `src/middleware.ts`.

Data is a **file-based SQLite** DB (`prisma/dev.db`) via Prisma 7 + the `better-sqlite3` native adapter.

## 2. Codebase snapshot (metrics)

| Metric | Value | Note |
|---|---|---|
| Source LOC (`src/**`) | ~29,400 | across ~210 TS/TSX files |
| `page.tsx` routes | 35 | 20 carry `force-dynamic` |
| API route handlers | 46 | `src/app/api/**/route.ts` |
| Components | 88 | 57 are `"use client"` |
| `src/lib` modules | 31 | non-UI logic |
| Prisma models | 16 | |
| Unit tests | 130 (16 files) | all under `src/app/api/test/` |
| `TODO/FIXME/HACK` | **1** | unusually low |
| `@ts-ignore` / `@ts-expect-error` | **0** | |
| `any` casts | **1** | |

**Read:** the code is clean and disciplined (near-zero suppressions, strong typing, a thorough `docs/` set, 130 passing unit tests). The risks below are mostly **architectural scale, security posture, data-integrity edge cases, and process gaps** — not code rot.

## 3. Core data flows

**Public page render** (`docs/architecture.md` confirms):
`app/<route>/page.tsx` → `renderPageBlocks(slug)` (`src/components/blocks/render-page.tsx`) → loads `Page.publishedContent` (falls back to live `PageBlock` rows pre-first-publish) → `resolveBlockContents()` swaps `media:{id}` → file paths → if 中文, `localizeBlockContents()` swaps cached translations (miss ⇒ English) → `BlockRenderer` (a `switch` on `type`) renders `sections/*`. Block metadata is pure data in `src/lib/blocks/registry.ts` (shared by server renderer **and** client editor). Studies use a parallel path via `resolveStudyLayoutBlocks()` → `StudyLayoutView`, else default `StudyContent`.

**Admin publish:** editor mutates live `PageBlock` rows via `/api/admin/pages/<slug>/blocks*`; **Publish** (`/publish`) snapshots visible/ordered blocks into `Page.publishedContent`, records a `PageRevision`, and **warms 中文 translations on the write path** (`warmBlockTranslations`) so the read path never calls the translation API. Discard/restore operate on draft vs published. Helpers are pure in `src/lib/page-publish.ts`.

## 4. Hotspots (largest / highest-coupling files)

| File | LOC | Risk | Suggested action |
|---|---|---|---|
| `src/components/layout/Navbar.tsx` | **1124** | God-component: nav + **search** (query/results/loading/keyboard nav) + language toggle + mobile menu + 3 dropdowns, all in one client file | Split into `Navbar` shell + `SearchBox` + `LanguageToggle` + `MobileMenu` + `NavDropdown`. High maintainability win. |
| `src/app/admin/publications/page.tsx` | 767 | Largest admin page; sync + review UI + filters in one client component | Extract review-row, filter bar, sync controls. |
| `src/lib/blocks/registry.ts` | 704 | Central source of truth; pure data, but a single edit point everything depends on | OK as data, but consider splitting per-category and adding a schema/validation test. |
| `src/components/admin/page-editor/PageEditor.tsx` | 569 | Core editor; reused by pages + study layouts | Already modularised around it; watch growth. |
| `fields.tsx` (491), `RowEditor.tsx` (482) | | Editor field rendering complexity | Covered by existing tests; keep. |

## 5. Prioritised issues (top 20)

Severity: 🔴 high · 🟠 medium · 🟡 low. "TODO" = already on Cam's tracker.

### Security & auth
1. 🔴 **Unauthenticated test endpoints in production code.** `GET /api/test/prisma` (`src/app/api/test/prisma/route.ts`, runs `prisma.study.count()`) and `GET /api/test/orcid` (`src/app/api/test/orcid/route.ts`, fetches ORCID works for a hardcoded id) are public — not behind the admin matcher. Low data exposure but they shouldn't ship. **Remove both** (or gate behind middleware). *(TODO lists `/api/test/prisma`; the `orcid` one is an additional find.)*
2. 🟠 **Single shared-password admin model.** One `ADMIN_PASSWORD` → `{role:"admin"}` JWT (`src/lib/admin-session.ts`, HS256, 7-day). Prototype-grade: no per-user identity, no rotation, no audit trail. Acceptable for a capstone **if documented** and deployed with strong secrets. Document the decision + trade-offs.
3. 🟠 **Default secrets must not reach a deploy.** `.env.example` ships `ADMIN_PASSWORD="change-me"` / placeholder `ADMIN_SESSION_SECRET`; the dev `ADMIN_PASSWORD` is `123456`. Ensure Render env vars are strong/random (deployment checklist already calls this out).
4. 🟡 **Input/upload hardening review pending.** Block/study/media write paths, `sanitize-html` usage, and `public/uploads/` file handling deserve a focused pass (see P6 in the playbook → `docs/reports/admin-security-review.md`).

### Data integrity
5. 🔴 **Publication hard-delete resurrects on re-sync.** Deleting a `Publication` leaves no marker, so the next ORCID/OpenAlex sync recreates it (`@@unique([sourceType,sourceId])` only dedupes *existing* rows). Client explicitly asked "once deleted, never comes back." Needs a tombstone table or soft-delete the sync respects. *(TODO; playbook P2.)*
6. 🟠 **Auto-approval too loose.** `classifyPublicationRelevance` (`src/lib/publication-filter.ts`) can auto-approve on a single strong-keyword hit; client wants approval gated to **affiliation-phrase** matches, else Pending. *(TODO; playbook P1.)*
7. 🟠 **Media referenced only by hardcoded path in `.tsx` is invisible to the usage scan.** `findAssetUsage()` (`src/lib/media-resolve.ts`) can't see images hardcoded in component source, so "where is this used / safe to delete" under-reports. Documented in-code; keep grepping components when repointing assets.
8. 🟡 **Order-int overflow** is guarded via `src/lib/order.ts` (clamps client-set order) — keep that guard on all order writes; out-of-range values previously crashed admin list reads.
9. 🟡 **Broken media rows** (≈3 known 404 thumbnails) — detect/report before pruning (playbook P8); don't blind-delete.

### Process & deployment
10. 🔴 **No CI.** GitHub-hosted Actions are disabled org-wide (billing) — every runner job fails at startup, so there's no automated typecheck/lint/test/build gate. Mitigation shipped: `npm run verify` (PR #155) + Copilot review + cloud-session self-verify. Re-enable the committed CI workflow if org billing is restored.
11. 🟠 **Migration history has drifted** → team uses `prisma db push`, not `migrate`. Fine locally, but a deploy needs a deliberate choice (reconcile history for `migrate deploy`, or commit to `db push`). Documented in `docs/database.md`.
12. 🟠 **Hosting constraints are real.** File-SQLite + `public/uploads/` + native `better-sqlite3` ⇒ needs a persistent-disk host (Render Starter), absolute `DATABASE_URL`, host-built native module, and guarded seeds. Serverless/Vercel would silently reset data. (deployment.md covers it.)
13. 🟡 **Visual-regression baselines are macOS-only** (`*-chromium-darwin.png`). Any Linux/CI run (incl. cloud sessions) diffs against the wrong platform; needs committed `-linux` baselines (playbook D1).

### Testing & quality
14. 🟠 **Unit tests only cover `src/app/api/test/**`.** The vitest `api` project's include pattern excludes `src/lib/**/*.test.ts`, so new lib tests won't run unless added there or the config gains a project. Raise coverage on `page-publish`, `media-resolve`, `translate/blocks`, `publication-filter` (playbook P4/X4).
15. 🟠 **Admin a11y + mobile** not yet audited (focus management in page-editor popovers, labels, contrast, keyboard alternative to drag-reorder) — playbook P5.
16. 🟡 **e2e admin happy-path is thin** (read-only smoke; now tracked in `e2e/admin.spec.ts`). Add a couple more screen-load checks; mutation round-trips later.

### Frontend / performance / i18n
17. 🟠 **`Navbar.tsx` god-component** (#4 above) — top maintainability refactor; also where public search lives, so coordinate with P3 (search is largely built, not greenfield).
18. 🟠 **Everything is `force-dynamic`** (20 pages) → no caching; every request re-reads the DB and some self-fetch the internal API (`getApiBaseUrl()` / `NEXT_PUBLIC_BASE_URL`). Audit which pages could safely cache, and the N+1 reads on admin list pages (playbook X6).
19. 🟠 **Self-fetch coupling.** Server components fetching the internal API via `NEXT_PUBLIC_BASE_URL` is fragile (wrong base ⇒ blank prod). Prefer direct data-layer calls where a self-HTTP hop adds nothing; at minimum keep the env var correct per environment.
20. 🟡 **i18n coverage gaps + dead ends.** Hardcoded English strings / untranslated block fields exist beyond `en.ts`/`zh.ts` (playbook X3 — never overwrite native ZH). Plus dead ends: `MailingListSignup` → nonexistent `/api/mailing-list`, the `/case-studies` stub, a "posture" dead link (playbook P7).

## 6. Strengths (keep doing this)

- **Disciplined code:** 1 TODO, 0 type suppressions, 1 `any` across ~29k LOC.
- **Clean separation:** pure block registry shared by server + client; pure publish/translate helpers; thin pages delegating to `renderPageBlocks`.
- **Smart translation model:** translate-on-write + DB cache means zero translation API calls on the read path, with safe English fallback.
- **Good docs:** an unusually complete `docs/` set (architecture, admin-cms, database, deployment, environment, styling, troubleshooting).
- **Real tests:** 130 unit tests covering the API/logic core, plus visual-parity + admin e2e specs.

## 7. Suggested order of attack

1. **Client-requested correctness (highest):** #6 auto-approval (P1), #5 hard-delete tombstone (P2).
2. **Security hygiene:** #1 remove test endpoints, #2 document auth, then the P6 security review.
3. **Coverage + a11y:** #14 tests (P4/X4), #15 admin a11y (P5).
4. **Maintainability + perf:** #17 Navbar split, #18 caching/N+1 (X6), #20 i18n (X3) + dead-end cleanup (P7).
5. **Deploy readiness:** #11/#12 migration+hosting decisions, #13 Linux visual baselines (D1).

> Most items map to a ready-to-run prompt in `keep-local-…/CLOUD-PLAYBOOK.md`. CI being unavailable (#10) means each change must self-verify via `npm run verify` (+ `npm run build`) before merge.
