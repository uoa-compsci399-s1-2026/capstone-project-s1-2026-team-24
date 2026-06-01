# Local Run Log

## 2026-05-27 - Codex local web startup

Branch:
- Created and switched to `test`.

Visible app:
- Opened the repository in Visual Studio Code.
- Started the Next.js dev server from the Codex task terminal, not the VS Code integrated terminal.
- Local URL: http://127.0.0.1:3000

Commands run to make the local site work:
- `npm install --cache /private/tmp/codex-npm-cache --loglevel=warn`
- `DATABASE_URL="file:./dev.db" npx prisma generate`
- `DATABASE_URL="file:/Users/patrick/Projects/capstone-project-s1-2026-team-24/dev.db" npx prisma migrate deploy`
- `DATABASE_URL="file:/Users/patrick/Projects/capstone-project-s1-2026-team-24/dev.db" npx prisma db push`
- `DATABASE_URL="file:/Users/patrick/Projects/capstone-project-s1-2026-team-24/dev.db" npm run seed:pages`
- `npm run dev -- --hostname 127.0.0.1`

Files/directories changed locally:
- `node_modules/` was removed and reinstalled because the existing install was incomplete and missing `sanitize-html`.
- Prisma client files were generated under `node_modules/`.
- `dev.db` was updated locally:
  - applied migration `20260523000000_add_page_builder`
  - synced current Prisma schema via `prisma db push`
  - seeded page-builder content for `home`, `about`, `studies`, `research`, `team`, `collaborations`, `collaborations-academic`, `collaborations-industry`, and `contact`

Git/source impact:
- No application source files were changed.
- `node_modules/` and `dev.db` are ignored by Git.
- This log file records the local environment/database preparation for traceability.

Verification:
- Homepage rendered at http://127.0.0.1:3000/
- Browser title: `Home | Human Nutrition Unit`
- Server returned `GET / 200`

## 2026-05-30 - Feature notes (no new run)

Capabilities landed on `main` since the run above, worth knowing when exercising the app locally:

- **Site-wide search** — the navbar search box hits `GET /api/search`; it covers pages, studies, team members, approved publications, and page-builder block content.
- **Publications auto-sorting** — `/admin/publications` has an "Automatic sorting" panel that routes each synced ORCID work to Approved/Pending/Rejected per admin-configurable rules (default: affiliation-only auto-approval).
- **Durable publication deletes** — deleting a publication writes a `DeletedPublication` tombstone, so the ORCID sync no longer re-creates it on the next run.
- **`npm run verify`** — quick pre-PR gate (`tsc --noEmit` + ESLint + the API Vitest project).
