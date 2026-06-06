# Seeds & migrations: database-workflow debt plan

> **Status:** plan / decision record. **No implementation in this PR.**
> Resolves backlog items **B41** (Prisma migration drift) and **B48** (regenerate the
> seed from a live DB dump). Both are marked `🔭 defer` in
> [`MASTER-BACKLOG.md`](../reports/MASTER-BACKLOG.md), but they block a safe, reproducible
> deploy + onboarding story, so this records the decisions and the implementation slices.

## 1. Summary & scope

Two problems, one root cause: **the production database is the source of truth, and our
tooling doesn't treat it that way.**

- **B41** — the committed Prisma migration history cannot rebuild the current schema, and
  production was never built from migrations at all. We must decide, once, how schema
  changes reach the live instance. **Decision: commit to `prisma db push`** (see §2).
- **B48** — a fresh clone's only local content is `prisma/seed.ts` + `seed-page-blocks.ts`,
  which are stale, hand-written, partial snapshots; the seed is destructive and has no guard
  against being pointed at prod. **Design: a `prisma/dump-to-seed.ts` that regenerates the
  seed from a pulled copy of the live DB, PII-safe** (see §3).

### Non-negotiable constraints (hard-won operational facts)

1. **Render build *and* pre-deploy run on separate compute with no access to the persistent
   disk.** A pre-deploy `prisma db push` silently no-ops against a scratch DB, and a
   statically-built sitemap that read the DB killed a deploy (already fixed —
   `src/app/sitemap.ts` is `export const dynamic = "force-dynamic"`). **Schema changes must
   apply at START time** on the real instance, where the disk at `/var/data` is mounted.
2. **The prod DB (`file:/var/data/app.db`) is the source of truth.** `prisma/seed.ts` and
   `prisma/seed-page-blocks.ts` are stale partial snapshots — **seeding prod would wipe live
   content.** `seed.ts` even falls back to `file:./dev.db` when `DATABASE_URL` is unset
   (`prisma/seed.ts:17`), and `deleteMany()`s 8 tables (`prisma/seed.ts:51-58`).
3. **No CI; merging to `main` deploys production.** Schema review happens only in PR review of
   `schema.prisma`. Mistakes ship.
4. **Single 512 MB Render instance.** Memory- and disk-heavy operations (table rebuilds,
   image optimization) are real risks, not theoretical ones.

### Verified current state

- `prisma/migrations/` holds **8** migrations (`20260421112607_init` →
  `20260605000002_contact_recipient_inquiry_types`). `migration_lock.toml` pins `sqlite`.
- **The migration history has a gap.** `grep` confirms **no migration** defines
  `DeletedPublication` or the entire `PublicationFilterSetting` table (incl.
  `routeUnitAffiliation`, `affiliationPhrases`, `institutionRors`, …). These were applied via
  `db push` (PRs #157/#158/#160), then *newer* migrations (`20260605…`, PRs #184/#185/#187)
  were layered on top of the gap. So replaying migrations onto an empty DB produces a schema
  **missing two whole tables** → the app crashes (the ORCID/OpenAlex sync route and the
  filter-settings admin page query them).
- Prod was built by `db push`; its `_prisma_migrations` ledger is therefore unreliable for
  baselining a switch to `migrate deploy`.
- `prisma.config.ts` sets `migrations.seed = "tsx prisma/seed.ts"` and loads env via
  `prisma/load-env.ts` (`.env.local` then `.env`; never overrides real platform env). The
  runtime client uses `@prisma/adapter-better-sqlite3` (`src/lib/prisma.ts`).
- Reusable building blocks already present: `seedPageBlocks()` (idempotent upsert + revision
  snapshot), `prisma/catalog-public-media.ts` (media fallback), `prisma/backfill-*.ts` (the
  one-off guarded-script pattern), `prisma/inquiry-type-seed-data.ts` (shared constants).

---

## 2. B41 — Decision: commit to `db push`

**Decision: `prisma db push` is the official schema mechanism in every environment — local,
preview, and production. Prisma *migrations* are not used.**

### Why (the load-bearing reasoning)

We considered two options and reject backfilling migrations:

| | **Commit to `db push`** (chosen) | **Backfill migrations → `migrate deploy`** (rejected) |
|---|---|---|
| Matches reality | ✅ prod was already built this way | ❌ requires reconstructing history that never existed |
| Riskiest step | none beyond normal schema diffs | **baselining `_prisma_migrations` onto the live 512 MB prod DB** via `migrate resolve --applied`, on a box where build/pre-deploy can't see the disk — a one-shot, high-stakes op right before launch |
| Data-loss posture | `db push` **refuses data-loss by default** — additive changes (the norm here) apply idempotently; destructive ones fail loud | `migrate deploy` is safe, but the SQLite migrations Prisma generates are heavy **table-rebuilds** (drop+recreate+copy), risky on a small live DB |
| Team fit | low ceremony; the gap proves migration discipline already lapsed | needs disciplined, conflict-prone migration files across feature branches |
| Reversibility | ✅ can baseline a clean migration history *later*, once schema stabilizes, from a known-good DB | hard to undo a bad baseline |

`db push`'s default refusal of data-loss operations is a *feature* here: the overwhelming
majority of changes in this codebase are additive (new tables, new nullable/defaulted
columns), which apply cleanly; the rare destructive change fails loudly rather than silently
corrupting the source of truth.

This decision is **reversible**: once the schema stabilizes post-launch, the team can adopt a
clean migration baseline generated from the live DB — far lower risk than baselining onto a
db-push-built prod under launch pressure.

### Consequences (spelled out)

**Render start command.** Schema must apply at START (the only phase with the disk mounted):

```
# build phase (no disk needed): generate the client only
npx prisma generate && npm run build

# start phase (disk mounted at /var/data): sync schema, then serve
npx prisma db push --skip-generate && npm run start
```

(`npx prisma` for the CLI — consistent with `docs/deployment.md` and because the `prisma`
binary isn't reliably on `PATH` on Render outside an npm script. `npm run build` / `npm run
start` invoke the package's `next build` / `next start` bins for the same PATH reason.)

- `npx prisma generate` stays in **build** — it needs the schema, not the DB.
- **Do not pass `--accept-data-loss`.** A destructive diff then *aborts the deploy* instead of
  nuking data. (See the manual escape hatch below for intentional destructive changes.)
- **Caveat — SQLite classifies more changes as data-loss than "additive" suggests.** Because
  SQLite lacks most `ALTER`s, Prisma rebuilds the table (create-copy-drop-rename) for changes
  that *look* additive — e.g. adding a `NOT NULL` column without a default, or changing a
  column's type/default. Such a deploy hits the data-loss guard, `db push` exits non-zero,
  `&&` blocks `npm run start`, and the instance fails to boot until resolved. So treat *any*
  non-trivial schema change as deploy-affecting: rehearse the `db push` against a prod snapshot
  copy **before** merging (merging deploys prod), and reach for the manual pre-deploy step
  below when the diff isn't cleanly additive.
- **Never** put `db push` in build or pre-deploy — no disk there, so it silently no-ops
  against a scratch DB.
- Implementation check: confirm the `prisma` CLI and `prisma/schema.prisma` are present in the
  start environment (they ship with the repo + `node_modules`; verify they survive into the
  start image).

**Local branch-switching.** After `git switch`, run `prisma db push` (and `prisma generate`
if the client changed) to converge `prisma/dev.db` with the branch's schema. Additive diffs
apply silently. A branch that *drops* a column makes `db push` refuse without
`--accept-data-loss`, which protects your local data — reset locally if the drop is intended.
There are **no `migrate dev` reset prompts** (the pain the team hit before disappears).

**Future schema changes.** The workflow becomes:

1. Edit `prisma/schema.prisma`.
2. `npx prisma db push` locally → `npx prisma generate`.
3. Commit `schema.prisma` (and the generated client if committed). **PR review reviews the
   schema diff** — that is the change record, in lieu of migration files.

For **destructive / rename** changes (column drop, type narrowing, rename): author a one-off
guarded data-migration script following the existing `prisma/backfill-*.ts` pattern, and run
it **manually on the instance *before*** the deploy that lands the destructive schema. That
way the start-time `db push` only ever sees a safe, additive diff and won't abort.

### Disposition of `prisma/migrations/`

- Move the folder to `prisma/migrations-archive/` with a `README.md` pointing to this doc, so
  nobody runs `migrate deploy` against the drifted history.
- **Update `prisma.config.ts`:** it currently hard-codes `migrations.path = "prisma/migrations"`.
  When the folder is archived, point this at `prisma/migrations-archive/` (or drop the `path`
  key) so Prisma CLI commands don't break on a missing directory. Keep the `migrations.seed`
  key (the seed command still works).
- Document that `prisma migrate dev` / `prisma migrate deploy` are **off-limits** for this repo.

### Doc cleanup (part of the B41 slice)

- `docs/database.md` currently says "five migrations" — it's **eight**, and the "why db push"
  section should state db push is *the* mechanism (not "default for local dev").
- `docs/deployment.md` says "`db push` *or* `migrate deploy` — pick one and be consistent."
  Replace with the decision: db push, applied at start.

---

## 3. B48 — Design: `prisma/dump-to-seed.ts`

**Goal:** regenerate the seed *from a pulled copy of the live DB* so a fresh local setup looks
like production — PII-safe, and impossible to point the destructive seed at prod.

### Pipeline

1. **Input:** a **read-only copy** of the live DB, path passed as a CLI arg
   (`tsx prisma/dump-to-seed.ts ./prisma/snapshots/prod-2026-06-06.db`). Open it with
   better-sqlite3 `{ readonly: true }` — **not** via `DATABASE_URL`, so the dump can never be
   confused with the seed target. Refuse input paths under `/var/data` (force a copy).
2. **Export** rows in **FK-dependency order** (below), applying the PII policy.
3. **Emit** deterministic per-model JSON under `prisma/seed-data/*.json`. Keep `seed.ts`
   **thin** — `createMany` from the JSON, no embedded literals. Page blocks reuse the existing
   `seedPageBlocks()` upsert + revision-snapshot path (don't duplicate it).

### FK-dependency order

```
PublicationCategory → TeamMember → Study → StudyPdf → Publication → PublicationAuthor
→ PartnerLogo → ContactRecipient → PublicationFilterSetting → Page → PageBlock
→ PageRevision → SiteSettings → MediaAsset → (optional) TranslationCache, DeletedPublication
```

### PII policy

| Disposition | Models / fields | Notes |
|---|---|---|
| **DROP entirely** | `ContactSubmission` (all rows) | Public contact-form PII. Hard denylist **plus an assertion that fails the dump** if the table is ever touched. |
| **SCRUB to placeholder** | `Study.contactEmail` / `contactPhone` / `contactPhoneZh`; `ContactRecipient.email` | Replace with `TODO_*@example.com` / placeholder phone (mirrors the existing seed's `TODO_` convention). Keeps real staff/admin contact data out of git. |
| **VERBATIM (public by design)** | `TeamMember` name/title/photo/orcid/bio; `PartnerLogo`; `Page`/`PageBlock` content; `Publication`; `Study` copy; categories | Already published on the site. |

### Destructive-seed safety — "impossible to point at prod" (layered)

1. **`dump-to-seed` is read-only** and refuses `/var/data` input paths (must be a copy).
2. **Guards at the top of `seed.ts` *and* `seed-page-blocks.ts`:** throw if `DATABASE_URL`
   matches a prod pattern (absolute path under `/var/data`, or filename `app.db`) **or** if
   `NODE_ENV === "production"`; require an explicit local target. **Remove the silent
   `|| "file:./dev.db"` fallback** (`seed.ts:17`, `seed-page-blocks.ts`) — replace with an
   explicit local default that warns.
3. **Documented pull procedure** (consistent, non-locking snapshot):
   ```
   # on the Render instance shell
   sqlite3 /var/data/app.db ".backup /tmp/snap.db"
   # then download /tmp/snap.db → prisma/snapshots/  (gitignored)
   ```

### Media & optional includes

- **Media:** export `MediaAsset` metadata, but **split verification by path class** — the
  files split into two homes:
  - **Git-tracked assets** (`/images/…`, committed in `/public`): verify each `filePath`
    exists and **fail loud** on a miss (a real broken reference).
  - **Runtime uploads** (`/uploads/…`, e.g. `/uploads/media/x.png`): these live under
    `public/uploads/`, which is **gitignored** (`.gitignore:67`) and exists only on the prod
    persistent disk — so they are absent from a fresh clone *by design*. A hard "fail on
    missing file" here would abort on the normal case. Instead: pull `public/uploads/`
    alongside the DB snapshot when a faithful media set is wanted (rsync from the instance to
    a local, also-gitignored `public/uploads/`), and otherwise **downgrade a missing upload to
    a warning** (the metadata row still seeds; the image renders once uploads are present).

  `npm run catalog:media` remains the fallback for the git-tracked set.
- **Optional:** include `TranslationCache` (so 中文 isn't cold on first run) and
  `DeletedPublication` (so the next ORCID/OpenAlex sync doesn't resurrect deleted works).

### Refresh cadence

Document in `docs/database.md`: regenerate the seed when studies / team / partners / home copy
change materially. Snapshot filenames carry the date so staleness is visible.

---

## 4. Slices (incremental, each reviewable & independently shippable)

1. **B41 docs + config** — archive `prisma/migrations/` and update `migrations.path` in
   `prisma.config.ts` accordingly, change the Render start command to
   `npx prisma db push --skip-generate && next start`, fix `docs/database.md` and
   `docs/deployment.md`. *Lowest risk; unblocks the deploy story.*
2. **Seed safety guards** — prod-path + `NODE_ENV` guards and removal of the silent
   `dev.db` fallback in `seed.ts` and `seed-page-blocks.ts`.
3. **`dump-to-seed.ts` + JSON data layer** — the export script and the thin-seed refactor to
   read `prisma/seed-data/*.json`; wire in `seedPageBlocks()` reuse.
4. **PII scrub + media verification + optional includes + the denylist assertion.**
5. **Pull-procedure + refresh-cadence docs.**

## 5. Risks & mitigations

- **Start-time `db push` aborts the deploy** → fails *with no data loss*, but a rebuild-class
  diff (even a "looks additive" one on SQLite, §2 caveat) takes the instance down until
  resolved. Mitigation: rehearse `db push` against a snapshot before merging; manual pre-deploy
  step (§2) for non-additive changes.
- **Stale snapshot** → seed diverges from prod. Mitigation: documented refresh cadence +
  dated snapshot filenames.
- **Accidental prod seed** → layered guards + read-only dump + denylist assertion (§3).
- **`MediaAsset` references a file absent from the clone** → hard-fail for git-tracked
  `/images/…`, but **warn (not fail)** for disk-only `/uploads/…` (gitignored); optionally
  pull `public/uploads/` with the snapshot (§3 Media).
- **Someone runs `migrate deploy` later** → archived folder + README + explicit doc warning.

## 6. Rollback

- **B41:** the start command is one line — revert to `npm run start`; un-archive
  `prisma/migrations/` if reversing the decision.
- **B48:** `dump-to-seed.ts` and `seed-data/*.json` are additive new files. Keep the existing
  hand-written seed path alongside until the regenerated seed is trusted, then remove it in a
  follow-up.

## 7. Verification (for the eventual implementation)

- **`db push` start path:** confirm the schema applies at START on the instance (disk
  mounted), not in build/pre-deploy — deploy, then check a newly-added column exists in
  `/var/data/app.db`.
- **`dump-to-seed`:** run against a snapshot copy → assert `ContactSubmission` rows are absent
  from `seed-data/`, staff/admin emails are scrubbed, git-tracked `/images/…` `MediaAsset`
  paths resolve (disk-only `/uploads/…` may warn), and a fresh local `npx prisma db push &&
  npm run seed` reproduces a site that matches production.
- **Guards:** confirm `seed.ts` throws when `DATABASE_URL` points at a `/var/data` or
  `app.db` path, and when `NODE_ENV=production`.

## 8. Out of scope

Implementing `dump-to-seed.ts`, the seed refactor, the guard code, or changing the live Render
configuration. This PR is the plan / decision record only.
