# Deployment

Stack-specific facts for building and hosting this app, plus a readiness checklist. The constraints here come from the storage layer, not Next.js per se.

> **Is the site even deployed for the course?** That's an **open question** — this doc is factual and optional. It describes *what a real deployment would require* so the decision is informed; it does not assume you must deploy. Reference for the framework side: `node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md`.

## The stack determines the host

| Layer | Implication for hosting |
|-------|-------------------------|
| Next.js 16 (App Router, mostly `force-dynamic`) | Runs as a long-lived **Node.js server** (`next build` → `next start`) or a Docker container. Not a good fit for static export. |
| Prisma 7 + **`better-sqlite3`** | `better-sqlite3` is a **native module** — it must be built/installed on the host's platform (don't ship a macOS build to a Linux box). |
| **File-based SQLite** (`prisma/dev.db`) | The database is a **file on disk**. It needs a **persistent, writable** volume that survives restarts/redeploys. |
| Runtime image uploads (`public/uploads/`) | Also written to disk at runtime → also needs persistent storage. |

### Why default serverless / Vercel is a poor fit

Serverless platforms (including Vercel's default target) give each invocation an **ephemeral filesystem**. With file SQLite that means:

- The `prisma/dev.db` you deployed is read-only / reset between cold starts — writes vanish or fail.
- `public/uploads/` (runtime media) doesn't persist either.

So the database and uploads would effectively reset. This app wants a host with a **persistent disk**.

### Hosting options that work

- **A persistent-disk platform:** Fly.io (a volume), Railway (a volume), or Render (a disk). Build the native module on the host and point `DATABASE_URL` at a file on the mounted volume.
- **A VPS / Docker** (any Node 20+ box): full control of disk and the native build. The Next.js docs list Node-server and Docker as supporting all features.
- **Serverless-friendly alternative — swap the DB.** If you specifically want serverless, move off file SQLite to **libSQL / Turso** via `@prisma/adapter-libsql` (a hosted SQLite-compatible DB over HTTP). That's a code + adapter change, not just config — out of scope for this doc, but the cleanest path to serverless.

## Build & run (Node server)

```bash
npm ci                  # install deps (builds better-sqlite3 for this host)
npx prisma generate     # generate the Prisma client
npx prisma db push      # or `migrate deploy` — create/sync the schema on the volume
npm run seed            # first deploy only: seed content (see note below)
npm run build           # next build
npm run start           # next start (serves the production build)
```

`package.json` already defines `build` (`next build`) and `start` (`next start`), which is all a Node host needs.

> **`db push` vs `migrate deploy`.** Locally the team uses `prisma db push` because the committed migration history has drifted (see [database.md](./database.md)). For a server you can use either: `db push` to sync the schema to the file, or `prisma migrate deploy` if you've reconciled the migration history first. Pick one and be consistent. Run **seeds only on the first deploy** (or guard them) — re-running `npm run seed` **wipes and reseeds** content and would clobber admin edits.

## Readiness checklist

Storage:

- [ ] **SQLite on a persistent volume**, referenced by an **absolute path** in `DATABASE_URL` (e.g. `file:/data/app.db`). Don't rely on a CWD-relative path like `file:./prisma/dev.db` in production.
- [ ] **`public/uploads/` on persistent storage** (or a mounted volume) so runtime media survives redeploys.
- [ ] A **backup** of the SQLite file (and uploads). It's a single file — snapshot/copy it on a schedule.
- [ ] `better-sqlite3` built on the **host platform** (`npm ci` on the host, or a matching Docker base image).

Schema & data:

- [ ] `prisma generate` run during build; `prisma db push` (or `migrate deploy`) run against the volume DB on deploy.
- [ ] Seeds run once / guarded so deploys don't overwrite content.

Secrets & config (platform env — never commit real values; see [environment.md](./environment.md)):

- [ ] **`ADMIN_PASSWORD`** — strong, not the `change-me` placeholder.
- [ ] **`ADMIN_SESSION_SECRET`** — long random string (signs the admin JWT).
- [ ] **`DATABASE_URL`** — absolute `file:` path on the persistent volume.
- [ ] **`NEXT_PUBLIC_SITE_URL`** — set to the deployed origin for canonical metadata/SEO (default `http://localhost:3000` is wrong in prod).
- [ ] **`ALLOW_INDEXING`** — leave **unset** for test/staging deploys (serves a deny-all `robots.txt` + site-wide `noindex` so the site stays out of search engines). Set to `1` only at the official public launch.
- [ ] **`TRANSLATE_API_KEY`** (+ `TRANSLATE_REGION` for Azure) — only if 中文 machine translation of page copy is wanted; otherwise ZH falls back to English. Run `npm run warm:translations` after deploy to populate the cache.
- [ ] **`RESEND_API_KEY`** + **`EMAIL_FROM`** (on a domain **verified in Resend**) — for contact-form email delivery. Without them, submissions are still saved; email is skipped.

Serving:

- [ ] **HTTPS** in front of the app (the `admin_session` cookie is `secure` in production).
- [ ] Node **20+** runtime.

## Related docs

- [environment.md](./environment.md) — every variable, what reads it, and `.env` vs `.env.local`.
- [database.md](./database.md) — Prisma/SQLite workflow, seeds, `db push` vs `migrate`.
- [architecture.md](./architecture.md) — why pages are `force-dynamic` and how the block pipeline renders.
- [contributing.md](./contributing.md) — pre-PR checks and conventions.
