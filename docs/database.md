# Database

The app uses **SQLite** through **Prisma 7** with the `better-sqlite3` adapter. The database is a single file at **`prisma/dev.db`** locally. The schema lives in `prisma/schema.prisma`; the Prisma client is created in `src/lib/prisma.ts` (Prisma 7 requires an explicit adapter at runtime).

## The two-database gotcha (read this first)

`DATABASE_URL` resolves **relative to the current working directory**, and it must be:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

The old default `file:./dev.db` creates a **second, empty** database at the repo root. The app then reads that empty file and the site / media library look empty even after a successful seed. `.env.example` already has the correct value — keep it. If you've hit this, see [troubleshooting.md](./troubleshooting.md#media-library-empty-after-seeding).

> A couple of standalone scripts (`prisma/seed.ts`, `prisma/seed-page-blocks.ts`) fall back to `file:./dev.db` **only if `DATABASE_URL` is unset**. As long as your `.env` sets `DATABASE_URL` correctly, every script and the app agree on one database.

## Create and sync the schema

For local development, sync the SQLite file directly to the schema:

```bash
npx prisma db push            # create/sync prisma/dev.db from prisma/schema.prisma
npx prisma generate           # regenerate the Prisma client (after schema changes)
```

### Why `db push`, not `migrate dev`

There are five migrations in `prisma/migrations/` (`...init` through `...add_page_builder`), but the live schema has since advanced via `db push`, so the migration history has **drifted**. Running `npx prisma migrate dev` detects the drift and prompts to **drop and recreate the database** — which wipes your seeded data.

| Use | When |
|-----|------|
| `npx prisma db push` | **Default for local dev.** Syncs the SQLite file to `schema.prisma` without touching migration history. |
| `npx prisma migrate dev` | Avoid here — it prints a destructive-reset prompt because of the drift. |

If you change `schema.prisma`, re-run `db push` (and `prisma generate` so the client types update).

## Seeding

| Command | Script | Behaviour |
|---------|--------|-----------|
| `npm run seed` | `prisma db seed` → `prisma/seed.ts` | **Wipes and reseeds** studies, team, partners, and publications, then calls `seedPageBlocks` to populate the page-builder tables (`Page` + `PageBlock`). Reproduces the full default site. |
| `npm run seed:pages` | `prisma/seed-page-blocks.ts` | Re-seeds page blocks only. **Idempotent — skips pages that already have blocks**, so admin edits are preserved. Set `RESEED_PAGES=1` to delete and recreate every page's blocks. |
| `npm run catalog:media` | `prisma/catalog-public-media.ts` | Indexes raster images under `/public` (skipping `uploads/`) into `MediaAsset` rows so they appear in the media library. Idempotent — skips paths already in the DB. |
| `npm run warm:translations` | `prisma/warm-translations.ts` | Generates and caches 中文 translations for the whole site. Safe no-op without `TRANSLATE_API_KEY`. See [environment.md](./environment.md#machine-translation). |

Force a full page re-seed (discards admin page edits):

```bash
RESEED_PAGES=1 npm run seed:pages
```

## Maintenance scripts

One-off backfills / migrations (rarely needed after a fresh seed):

| Command | Purpose |
|---------|---------|
| `npm run migrate:richtext` | Migrate block content to the rich-text format. |
| `npm run backfill:media-dims` | Fill in width/height on existing media assets. |
| `npm run backfill:published` | Backfill the published flag on pages. |

## How scripts load env vars

This matters because the wrong `DATABASE_URL` is the top onboarding bug — keep it identical in `.env` and `.env.local`.

| Consumer | Loads | Notes |
|----------|-------|-------|
| Next.js app (`dev`, `build`, `start`) | `.env.local` then `.env` | Next's normal precedence: `.env.local` wins. |
| Prisma CLI (`db push`, `generate`, `migrate`) | `.env` | Via `prisma.config.ts`, which reads `env("DATABASE_URL")`. |
| `seed.ts`, `seed-page-blocks.ts`, `catalog-public-media.ts` | `.env` only | They `import "dotenv/config"` at the top. |
| `warm-translations.ts` | `.env.local` then `.env` | Imports `prisma/load-env.ts`, so it picks up `TRANSLATE_API_KEY` from `.env.local`. |

## Resetting the database

```bash
rm prisma/dev.db
npx prisma db push
npm run seed
npm run catalog:media
```

## Inspecting data

```bash
npx prisma studio             # browse/edit rows in a local GUI
```

## Related

- [environment.md](./environment.md) — env var reference and precedence
- [setup.md](./setup.md) — the full onboarding flow
- [admin-cms.md](./admin-cms.md) — how editors change this data at runtime
