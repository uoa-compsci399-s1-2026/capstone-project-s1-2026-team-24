# HNU Auckland

The public website and content-management system (CMS) for the University of Auckland's **Human Nutrition Unit** — a marketing site for the unit and its research, plus an admin console for staff to edit page content, manage studies/team, and sync publications.

Highlights: a block-based page builder with draft/publish and EN/中文 translation, a media library, **site-wide search** (navbar → pages, studies, team, publications, and page content), and an ORCID/OpenAlex **publications sync** with admin-configurable **auto-sorting** (Approved/Pending/Rejected routing) and durable **tombstone deletes** that survive re-sync.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js **16.2.2** (App Router) |
| UI | React **19.2.4** |
| Styling | Tailwind CSS **v4** — config lives in `@theme` in `src/app/globals.css` (**no `tailwind.config.js`**) |
| Database | SQLite via Prisma **7.7.0** (`better-sqlite3` adapter) |
| Rich text | Tiptap 3 |
| Email | Resend (contact form) |
| Tests | Vitest + Playwright; Storybook for components |

> **This is not the Next.js you know.** These are bleeding-edge versions whose APIs and conventions differ from older releases. Before writing code, read the bundled guides in `node_modules/next/dist/docs/` (installed with the project), and see [`docs/`](./docs) for project-specific guidance.

## Prerequisites

- **Node.js ≥ 20** (the toolchain targets `@types/node` v20)
- npm (ships with Node)

## Quickstart

A fresh clone has **no `.env*` file** (they are gitignored; only `.env.example` ships), so the first step is to create one.

```bash
npm install
cp .env.example .env          # DATABASE_URL is already correct in the example
npx prisma db push            # create/sync the SQLite schema at prisma/dev.db
npx prisma generate           # generate the Prisma client
npm run seed                  # seed studies/team/partners/publications + page blocks
npm run catalog:media         # index /public images into the media library
npm run dev                   # http://localhost:3000
```

> **Use `npx prisma db push`, not `prisma migrate dev`.** The committed migration history has drifted from the live schema, so `migrate dev` prints a scary destructive-reset prompt. `db push` syncs the schema safely. See [`docs/database.md`](./docs/database.md).

> **Keep `DATABASE_URL` as `file:./prisma/dev.db`.** The old default `file:./dev.db` creates a *second*, empty database at the repo root, making the site and media library look empty even after seeding. This is the #1 onboarding bug — see [`docs/troubleshooting.md`](./docs/troubleshooting.md).

The admin console lives at [http://localhost:3000/admin](http://localhost:3000/admin) (log in with the `ADMIN_PASSWORD` you set in `.env`).

## npm scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the Next.js dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run clean` | Remove the `.next` build cache |
| `npm run lint` | Run ESLint |
| `npm run seed` | Wipe + reseed studies/team/partners/publications **and** page blocks |
| `npm run seed:pages` | Re-seed page blocks (preserves existing pages unless `RESEED_PAGES=1`) |
| `npm run catalog:media` | Index raster images under `/public` into the media library |
| `npm run warm:translations` | Generate + cache 中文 translations (needs `TRANSLATE_API_KEY`) |
| `npm run migrate:richtext` | One-off migration of block content to rich text |
| `npm run backfill:media-dims` | Backfill width/height on media assets |
| `npm run backfill:published` | Backfill the published flag on pages |
| `npm run verify` | Pre-PR gate: `tsc --noEmit` + ESLint + the API Vitest project |
| `npm run test` | Unit tests (`vitest run`) |
| `npm run test:e2e` | End-to-end tests (`playwright test`, incl. an admin smoke test) |
| `npm run test:e2e:update` | Update Playwright snapshots |
| `npm run storybook` | Run Storybook (port 6006) |
| `npm run build-storybook` | Build the static Storybook |

## Languages & translation (English / 中文)

The navbar has a language toggle that switches between English and Simplified Chinese. There are **three kinds of text**, handled differently:

| Text | Examples | How it translates |
|------|----------|--------------------|
| **Fixed interface text** | nav, footer, buttons, form labels, Collaborations / Studies / Contact / Team section copy | Built-in dictionary (`src/messages/en.ts` & `zh.ts`). **Always works — no setup.** |
| **Admin-authored page copy** | hero titles, info-card & callout text, page bodies | **Machine-translated and cached** at publish/warm time. Needs `TRANSLATE_API_KEY`; otherwise **falls back to English.** |
| **Individual study pages** | a study's description, eligibility, compensation | **Manual, board-approved translations** entered in the admin console. **Never machine-translated** (ethics requirement). |

By default no translation key is set, so switching to 中文 shows Chinese for the fixed UI and English for admin-authored page copy until you add a key and warm the cache. To enable it, set `TRANSLATE_API_KEY` (and for Azure, `TRANSLATE_REGION`) then run `npm run warm:translations`. Full details, providers, and the caching model: [`docs/environment.md`](./docs/environment.md) and [`docs/content-editing.md`](./docs/content-editing.md).

## Documentation

Project docs live in [`docs/`](./docs) — start with the [docs index](./docs/README.md).

| Doc | Covers |
|-----|--------|
| [Architecture](./docs/architecture.md) | How the app is structured (App Router, blocks, data flow) |
| [Setup](./docs/setup.md) | Local onboarding, step by step |
| [Database](./docs/database.md) | Prisma/SQLite workflow, seeds, `db push` vs `migrate dev` |
| [Environment](./docs/environment.md) | Every env var, what reads it, and `.env` vs `.env.local` |
| [Content editing](./docs/content-editing.md) | Which file renders which section; page-block model |
| [Styling](./docs/styling.md) | Tailwind v4 `@theme`, brand colours |
| [Admin CMS](./docs/admin-cms.md) | Admin console: pages, studies, team, partners, publications |
| [Troubleshooting](./docs/troubleshooting.md) | FAQ for common onboarding issues |
| [Deployment](./docs/deployment.md) | Building and hosting (file-SQLite considerations) |
| [Contributing](./docs/contributing.md) | Conventions, tests, PR workflow |
