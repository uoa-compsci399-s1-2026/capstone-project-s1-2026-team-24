# Bug Hunt Report

**Date:** 2026-06-04
**Branch:** `audit/bugs`
**Scope:** Real correctness bugs (not style) across the codebase.
**Stack:** Next.js 16 (App Router) + React 19, Prisma 7 + better-sqlite3 (SQLite file DB), Tailwind v4, Render 512MB Starter + persistent disk. Pages mostly `force-dynamic`; `images: { unoptimized: true }` is deliberate.
**Out of scope:** Live-site CONTENT bugs (the in-repo seeds are a stale partial snapshot, and the live DB is not in the repo).

---

## How this was done (methodology)

The hunt was run as an agent team across five workstreams: (a) full API-route sweep, (b) numeric/DB edge
cases, (c) the block rendering pipeline, (d) the publications sync, (e) i18n + contact flows. Each
workstream produced candidate findings with `file:line` evidence. **Every load-bearing claim was then
re-verified against the source by the lead, and non-reproducible claims were discarded** — those discards
are documented in [§ Discarded / verified-safe](#discarded--verified-safe-claims) because the absence of a
bug where one was suspected is itself a useful result.

Note on the safety net: **no CI workflow enforces the test/build gate.** The repo does have a GitHub
Actions workflow (`.github/workflows/claude.yml`), but nothing runs `npm run verify`
(`tsc --noEmit && eslint && vitest run --project api`) on pushes/PRs — it is a local/manual gate. The `api`
vitest project covers `src/app/api/test/**` **only** (`vitest.config.ts:24-31`); the block pipeline, i18n,
and the end-to-end publications-sync flow are largely untested, which is where several findings below live.

### Severity summary

| Severity | Count | IDs |
| --- | --- | --- |
| Critical | 0 | — (none reproducibly confirmed; H1 is the closest to a production-impacting crash) |
| High | 1 | H1 |
| Medium | 3 | M1, M2, M3 |
| Low | 5 | L1, L2, L3, L4, L5 |

Severity reflects **verified, reproducible impact**, not how alarming the candidate first looked. Two
candidates that were originally proposed as Critical/High were downgraded or discarded after the lead pass;
one candidate that was proposed as Low was promoted to High.

---

## High

### H1 — Unclamped auto-increment `order` writes an out-of-range integer, crashing partner-logo reads

- **File:** `src/app/api/admin/partner-logos/route.ts:147-151` (computed), `:162` (written)
- **Supporting:** `src/lib/order.ts:1-15`, `parseOrder` at `src/app/api/admin/partner-logos/route.ts:25-30`

`src/lib/order.ts:1-5` documents the exact failure class this codebase has already been burned by: an
order value beyond the 32-bit signed `Int` range *writes to SQLite fine but throws when Prisma reads the
row back*, crashing any list that selects the column. `clampOrder` exists to prevent that, and the
`POST` handler correctly clamps the **explicit** order (`parseOrder` returns `clampOrder(parsed)` at
`:29`). But the **auto-increment fallback** is not clamped:

```ts
// partner-logos/route.ts:150-151
const nextOrder =
  parsedOrder ?? (maxOrderResult._max.order ?? -1) + 1;   // <-- not clamped
// ...
order: nextOrder,   // :162  -> written straight to a Prisma Int column
```

**Reproduction (2 API calls):**
1. `POST /api/admin/partner-logos` with `order = 2147483647` → `parseOrder` → `clampOrder` pins it to
   `MAX_ORDER` (2_147_483_647) and it is stored. (Any larger value also clamps to `MAX_ORDER`, so an admin
   only has to fat-finger a big number once.)
2. `POST /api/admin/partner-logos` with **no** `order` → `parsedOrder` is `undefined` →
   `nextOrder = MAX_ORDER + 1 = 2147483648`, written unclamped.
3. Any subsequent read that **selects** the `order` column decodes the out-of-range `Int` and throws. The
   admin partner-logos list does (`src/app/api/admin/partner-logos/route.ts:68-72` has no explicit
   `select`, so Prisma reads every scalar incl. `order`), and the `create` in step 2 also throws on its own
   response (it returns the new row). The **public** grid is *not* affected: `getPartnerLogos()`
   (`src/lib/data/partner-logos.ts:22-34`) and `GET /api/partner-logos` use an explicit `select` that omits
   `order` (it appears only in `orderBy`, which SQLite handles without Prisma decoding the value).

**Impact:** A single bad row breaks the admin partner-logos management UI (read-time crash) and persists a
poison value that stays invisible until something selects it; the public grid is spared by its explicit
`select`. This is the precise landmine `order.ts` was written to defuse, re-introduced on the one write path
that skips the clamp. Ranked High rather than Critical because impact is admin-only and triggering it
requires an unusual admin precondition (a near-`MAX_ORDER` row); once present, the admin screen stays broken
until the offending row's `order` is corrected.

**Fix sketch:**
```ts
const nextOrder = clampOrder(parsedOrder ?? (maxOrderResult._max.order ?? -1) + 1);
```
This is the only `order`/`position` write path in the repo that bypasses the clamp — see the
[clamp audit](#appendix-a--clamporder-call-site-audit). Consider a lint rule or a thin `writeOrder()` helper so future
auto-increment paths can't regress.

---

## Medium

### M1 — Study date badge is hardcoded to `en-NZ`, ignoring the language toggle

- **File:** `src/components/blocks/study/StudyBlocks.tsx:33-39`
- **Contrast:** the status pill in the *same component* is localized (`:51`, via `lang` from `:31` / `pick()` `:26-28`)

```ts
// StudyBlocks.tsx:33-39
const deadline = study.publishedAt
  ? new Date(study.publishedAt).toLocaleDateString("en-NZ", {
      day: "numeric", month: "long", year: "numeric",
    })
  : null;
```

The component already has `lang` in scope and uses it to localize the status label beside this badge, but
the date is pinned to `en-NZ`. A 中文 visitor sees a localized status pill next to an English-formatted
date (e.g. "4 June 2026" instead of "2026年6月4日").

**Impact:** User-visible i18n inconsistency on every study page for ZH users. Cosmetic, but it's exactly the
EN/中文 fallback correctness the audit was asked to check, and it's reproducible from code alone.

**Fix sketch:** derive the locale from `lang`, e.g.
`new Date(study.publishedAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-NZ", { … })`.

> **Also worth a look (not asserted as a bug):** the value is named `deadline` but reads
> `study.publishedAt`. If a study has a distinct closing/deadline date elsewhere, this is a semantic
> mismatch; flagged for the team to confirm against the schema (left out of the count because it depends on
> product intent / live content, which is out of scope).

### M2 — Unknown / drifted block type silently renders `null` in production

- **File:** `src/components/blocks/BlockRenderer.tsx:372-376`

```ts
// BlockRenderer.tsx:372-376
default:
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[BlockRenderer] Unknown block type: ${type}`);
  }
  return null;
```

If a `PageBlock.type` doesn't match any registry case — a renamed/removed block type with old rows still in
the DB, or schema drift between the stored content and the registry — the block renders as `null` **with
no signal in production** (the warning is dev-only). The section just disappears.

**Impact:** Silent content loss that is hard to diagnose (no prod telemetry, page still 200s). This is the
"blocks whose content shape drifted from the registry" case from the brief. Returning `null` instead of
throwing is a *defensible* defensive choice — the issue is the silence in production.

**Fix sketch:** emit a real server-side log/telemetry event on the `default` branch regardless of
`NODE_ENV`, and/or render an admin-only visible placeholder ("Unknown block: <type>") so editors notice.

### M3 — `case-studies` DELETE uses a weaker ID guard than every other route

- **File:** `src/app/api/admin/case-studies/[id]/route.ts:14-21`
- **Repo standard:** `Number.isInteger(id) && id > 0` (e.g. `src/app/api/admin/media/[id]/usage/route.ts:16`, and ~10 other id routes)

```ts
// case-studies/[id]/route.ts:14-21
const caseStudyId = Number(id);
if (Number.isNaN(caseStudyId)) {          // <-- weaker than the repo standard
  return NextResponse.json({ error: "Invalid case study ID" }, { status: 400 });
}
```

`Number.isNaN` only rejects `NaN`. A non-integer like `1.5` passes the guard; Prisma 7 then **rejects the
float `Int` argument and throws**, which the outer `catch` turns into a **500**.

**What this is NOT:** an earlier candidate claimed this "silently deletes the wrong row" (e.g. `1.5` → row
1). That is **not reproducible** — Prisma validates `Int` args and throws rather than truncating, so no
wrong-row delete occurs. The real defect is narrower: a non-integer id returns **500 instead of 400**, and
this is the lone id-validating route that diverges from the codebase's standard guard.

**Impact:** Wrong status code + an unhandled-arg path on a destructive endpoint + an inconsistency that
invites copy-paste of the weaker pattern. No data loss.

**Fix sketch:**
```ts
if (!Number.isInteger(caseStudyId) || caseStudyId <= 0) {
  return NextResponse.json({ error: "Invalid case study ID" }, { status: 400 });
}
```

---

## Low

### L1 — ORCID *summary* fetch is unhandled (while per-work detail fetches are not)

- **File:** `src/lib/orcid.ts:236` (call), throwing path `:143-158`; per-work detail is wrapped `:238-272`
- **Caller:** `src/app/api/admin/publications/sync/route.ts:152-155`, isolated by the per-member catch `:385-405`

`fetchNormalizedOrcidWorks` wraps each *detail* fetch in try/catch and degrades gracefully (falls back to
summary data), but the initial `fetchOrcidWorksSummary(orcidId)` call at `:236` is not wrapped, and
`fetchOrcidJson` throws on any non-2xx or non-JSON response (`:151-158`). A transient ORCID 5xx / HTML
error page on the summary endpoint therefore aborts that member's **entire** sync (0 works) rather than
degrading like the detail path does.

**Impact:** Bounded — the per-member `catch` records a failed member and continues; **no data is deleted or
corrupted** (see [the sync-never-deletes note](#discarded--verified-safe-claims)). It self-heals on the next
successful run. Inconsistent resilience, not a crash.

**Fix sketch:** wrap the summary fetch and either skip-with-warning or add a short retry/backoff, matching
the detail path's tolerance.

### L2 — Publications sync is a read-modify-write over stale in-memory maps (no transaction)

- **File:** `src/app/api/admin/publications/sync/route.ts:83-131` (snapshot reads), `:275` (update), `:311` (create)

The sync loads all publications and all tombstones into in-memory maps once at the start, then
creates/updates per work with no surrounding transaction or re-read. If an admin mutates the library
**during** a sync, the maps are stale: a concurrent delete can make an `update` hit a now-missing row
(Prisma `P2025` → that member fails), or a just-created tombstone can be missed.

**Impact:** Low — the sync is manual and infrequent, the window is small, the failure mode is a failed
member (not corruption), and it self-heals next run. Worth knowing, not urgent.

**Fix sketch:** re-check existence inside a `$transaction` for the write, or accept-and-document the
single-writer assumption (and ideally guard against concurrent syncs).

### L3 — DOI-less works dedupe on `title::year`, so distinct "Untitled work" items collide

- **File:** `src/app/api/admin/publications/sync/route.ts:197-209`; key builder `src/lib/publication-filter.ts:115-124`; title fallback `src/lib/orcid.ts:177,220`

The dedupe key is `doi || buildPublicationDedupKey({title, year})`. When a work has no DOI, the key is
`normalizePublicationTitle(title)::year`. ORCID works with a missing title are defaulted to `"Untitled
work"` (`orcid.ts:177,220`), so two genuinely different untitled works from the same year normalize to the
same key and the second is treated as a duplicate.

**Impact:** Low and narrow (requires multiple DOI-less, title-less works in the same year), but it
silently drops the second work.

**Fix sketch:** when DOI is absent and the title is the `"Untitled work"` placeholder, fall back to a more
unique signal (e.g. ORCID put-code / `sourceId`) instead of `title::year`.

### L4 — Detail-fetch error drops DOI/abstract for that work

- **File:** `src/lib/orcid.ts:254-270` (catch fallback `doi:null, abstract:null`); refreshed later via `src/app/api/admin/publications/sync/route.ts:281`

On a transient per-work detail failure, the work is stored from summary data with `doi: null` and
`abstract: null`. Because DOI feeds dedupe, a transient blip can change how that work is keyed until the
next successful sync refreshes it (the update path does set `doi: work.doi` at `src/app/api/admin/publications/sync/route.ts:281`).

**Impact:** Low / self-healing. Mostly a data-quality dip during upstream flakiness.

**Fix sketch:** a short retry on detail fetch, or don't overwrite a previously-known DOI with `null`.

### L5 — Search index silently skips blocks with unparseable content

- **File:** `src/app/api/search/route.ts:90-100` (`blocksToText`), catch/continue at `:94-98`

```ts
// search/route.ts:92-99
for (const block of blocks) {
  let parsed: unknown;
  try { parsed = JSON.parse(block.content); }
  catch { continue; }                 // <-- block dropped from the index, no signal
  collectText(parsed, parts);
}
```

A block whose stored `content` isn't valid JSON is silently excluded from the page's searchable text.

**Impact:** Low — search-quality degradation only (the page still renders; only its search coverage
suffers), and malformed JSON should be rare given `parseBlockContent`'s tolerant write path.

**Fix sketch:** log the parse failure (with page slug + block id) so a corrupt block is discoverable.

---

## Discarded / verified-safe claims

These were proposed during the sweep and **discarded after re-verification** — documented so the team knows
they were checked, not missed.

- **"Contact email failure is masked as success" → working as intended.**
  `src/app/api/contact/route.ts:175-201`. The submission is saved first and is the source of truth; the
  email is explicitly best-effort and the failure is logged. The code comments at `:184-186` document this
  deliberately, and the `.catch` at `:190-193` prevents a delivery failure from failing the request. The
  save-vs-email separation the brief asked about is implemented correctly: a DB-save failure *does* surface
  as 500; only email delivery is non-fatal. (Optional enhancement, not a bug: surface undelivered-email
  warnings in the admin UI, not just server logs.)
- **"Block reorder has a concurrency bug" → well-guarded.**
  `src/app/api/admin/pages/[slug]/blocks/reorder/route.ts:24-41` validates that the payload lists exactly
  the page's block ids and that all ids belong to the page, then applies positions inside a
  `$transaction` (`:43-50`). `position` is the array index, inherently bounded; no clamp needed. A
  concurrent delete makes the transaction fail cleanly (→ 500), not corrupt state.
- **"Missing ZH translation cache returns English" → intended graceful degradation.**
  `src/lib/translate/blocks.ts:298-307`. The chain is `cached → local ZH fallback → original English`.
  Falling back to English when no translation exists is the desired behavior, not a defect.
- **"Sync deletes everything when an upstream API is down" → false.**
  The sync only ever **creates/updates** (`src/app/api/admin/publications/sync/route.ts:275,311`); it has no delete path. Tombstones are
  written exclusively by the admin DELETE handler (`src/app/api/admin/publications/[id]/route.ts:141-190`,
  inside a transaction). Empty/failed ORCID or OpenAlex responses produce zero changes, not deletions —
  the "no results ⇒ wipe" failure mode does not exist here.
- **"`case-studies` silently deletes the wrong row (Critical)" → downgraded to M3.**
  Prisma 7 validates `Int` arguments and throws on a float id; it does not truncate `1.5`→`1`. The real
  issue is a wrong status code (500 vs 400), tracked as M3.
- **`clampOrder` itself is correct and consistently applied to client input.**
  `src/lib/order.ts:9-15` double-clamps (value and fallback). All *client-supplied* order inputs funnel
  through it — see Appendix A. Only H1's auto-increment path bypasses it.

---

## Test-coverage gaps (context for the above)

- `vitest.config.ts:24-31`: the `api` project (the gate's only test run) globs `src/app/api/test/**` only.
- Not covered by the gate: the block render pipeline (`BlockRenderer`, `media-resolve`, translate cache),
  i18n/locale rendering, and the publications-sync flow under upstream failure (5xx, non-JSON, partial
  member failure, concurrent mutation). H1/M1/M2/L1–L4 all live in this untested space.
- Recommendation: add `vitest` coverage for `clampOrder` write paths (incl. the auto-increment fallback),
  `BlockRenderer` unknown-type handling, and `fetchNormalizedOrcidWorks` summary-fetch failure.

## Recommended follow-ups

1. Fix **H1** first (one-line clamp); it's the only finding that crashes a screen at read time (the admin partner-logos list).
2. M1/M3 are tiny, safe, high-clarity fixes.
3. M2 + L1–L5 are resilience/observability improvements; batch them.
4. Happy to open separate fix PRs per finding (this report intentionally changes no source files).

---

## Appendix A — `clampOrder` call-site audit

`order`/`position` write paths and whether the clamp is applied. Table paths are relative to `src/app/`
(e.g. `api/admin/team/route.ts` → `src/app/api/admin/team/route.ts`); the findings above use full paths:

| Write path | File:line | Clamped? | Notes |
| --- | --- | --- | --- |
| Team create | `api/admin/team/route.ts:135` | ✅ | `clampOrder(formData.get("order"), 0)` |
| Studies create | `api/admin/studies/route.ts:108` | ✅ | `clampOrder(body?.order, 0)` |
| Study PDFs | `api/admin/studies/[id]/pdfs/route.ts:26` | ✅ | `parseOrder` → `clampOrder` |
| Partner logo — **explicit** order | `api/admin/partner-logos/route.ts:29` | ✅ | `parseOrder` → `clampOrder` |
| Partner logo — PATCH | `api/admin/partner-logos/[id]/route.ts:140` | ✅ | `clampOrder(body.order)`, defaults to existing |
| **Partner logo — auto-increment** | `api/admin/partner-logos/route.ts:151` | ❌ | **H1** — fallback `(max ?? -1) + 1` unclamped |
| Publication author link | `api/admin/publications/sync/route.ts:375,379` | n/a | constant `order: 1` |
| Block reorder / insert / duplicate positions | `…/blocks/reorder/route.ts:47`, `…/blocks/route.ts:50`, `…/duplicate/route.ts:44` | n/a | array-index / `insertAt`, inherently bounded |
