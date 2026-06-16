# HNU Auckland Website & CMS Platform

The public website and content-management system (CMS) for the University of Auckland's **Human Nutrition Unit** — a marketing site for the unit and its research, plus an admin console for staff to edit page content, manage studies/team, and sync publications.

Highlights: a block-based page builder with draft/publish and EN/中文 translation, a media library, **site-wide search** (navbar -> pages, studies, team, publications, and page content), and an ORCID/OpenAlex **publications sync** with admin-configurable **auto-sorting** (Approved/Pending/Rejected routing) and durable **tombstone deletes** that survive re-sync.

## Project links

- **Repository:** [uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24)
- **Project management:** [GitHub Issues](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/issues) and [Pull Requests](https://github.com/uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24/pulls)
- **Deployment:** confirm the active marking URL in the Canvas submission. The code is production-configured for a persistent Node/SQLite host such as Render; the expected public domain is `https://hnu.auckland.ac.nz` once the client domain is attached.
- **Admin console:** `<deployed-site-url>/admin`, or [http://localhost:3000/admin](http://localhost:3000/admin) locally.

## Tech stack

| Layer | Choice |
|-------|--------|
| Languages | TypeScript, JavaScript, CSS |
| Framework | Next.js **16.2.7** (App Router) |
| UI | React **19.2.4** |
| Styling | Tailwind CSS **v4** — config lives in `@theme` in `src/app/globals.css` (**no `tailwind.config.js`**) |
| Database | SQLite via Prisma **7.7.0** and `@prisma/adapter-better-sqlite3` **7.7.0** |
| Rich text | Tiptap **3.23.6** |
| Search | Fuse.js **7.4.1** |
| Authentication | `jose` **6.2.2** signed admin session cookies |
| Email | Resend **6.12.4** (contact-form notifications) |
| Tests | Vitest **4.1.4**, Playwright **1.59.1**, Storybook **10.3.5** |

> **This is not the Next.js you know.** These are bleeding-edge versions whose APIs and conventions differ from older releases. Before writing code, read the bundled guides in `node_modules/next/dist/docs/` (installed with the project), and see [`docs/`](./docs) for project-specific guidance.

## Prerequisites

- **Node.js >= 22.17.1** (see `package.json` `engines`)
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

## Usage examples

Public visitors can browse HNU information pages, search site content from the navbar, switch between English and Chinese, view current studies, download study PDFs, browse team/publication content, and submit a contact enquiry.

Admins can:

- edit public page content in `/admin/pages` using reusable blocks, draft preview, publish, discard, and revision restore workflows;
- manage studies, study PDFs, study-page layouts, team members, media assets, contact recipients, and contact submissions;
- sync publications from ORCID, enrich them with OpenAlex affiliation data, and review the Approved/Pending/Rejected publication buckets;
- warm cached Chinese translations for admin-authored page copy when a translation provider key is configured.

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

## Submission / credentials checklist

Do **not** commit real production secrets. For Canvas submission, provide the marker with:

- deployed public URL, if the site is deployed;
- admin URL (`<site-url>/admin`);
- admin login password;
- any test-only `.env` values needed to reproduce the marking environment, especially `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ALLOW_INDEXING`, optional `TRANSLATE_API_KEY`, and optional `RESEND_API_KEY`;
- any notes about disabled third-party services. The site still runs without translation and email keys: Chinese fixed UI remains available, admin-authored page copy falls back to English, and contact submissions are saved even if email delivery is disabled.

The final source code for marking must be merged into the repository's `main`/`master` branch on GitHub.

## Future plan

- Replace file-based SQLite with hosted persistent storage, or keep SQLite on a backed-up persistent volume with an explicit backup/restore runbook.
- Add stronger admin authentication, such as named admin accounts, role-based permissions, or University SSO.
- Complete a client-approved accessibility pass, including final alt text, keyboard/focus checks, and colour-contrast review.
- Add analytics for study recruitment, search usage, and contact enquiry conversion.
- Expand Chinese copy QA for all client-authored content and formalise the translation review workflow.
- Deepen integrations with University systems, REDCap/study recruitment workflows, mailing lists, and publication data providers.

## Acknowledgements

This project was developed for the University of Auckland Human Nutrition Unit as part of COMPSCI 399. It uses public documentation and tooling from Next.js, React, Prisma, Tailwind CSS, Tiptap, ORCID, OpenAlex, Resend, Vitest, Playwright, and Storybook.

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
