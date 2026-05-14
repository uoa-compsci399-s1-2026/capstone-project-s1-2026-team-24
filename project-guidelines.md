# Project Guidelines

**This file is the authoritative reference for how this project is built and how changes are made.** It is intended to be read by AI coding agents (Claude Code, Cursor, Copilot, others) and by human contributors before making any modification to the codebase. If you are an AI agent, read this file in full at the start of every session.

If anything in this file conflicts with what an agent's training data or a casual reading of the codebase would suggest, **this file wins**. If a teammate has asked for something that contradicts this file, stop and flag it; do not silently override the guidelines.

---

## 0. How to use this document

- **Section 1** is the most important: it tells you who owns what work, and why you should not touch areas you have not been assigned to.
- **Section 2** is the non-negotiable rules. Read them.
- **Sections 3 through 8** describe how this codebase is built (data layer, API layer, frontend layer, admin/CMS, conventions). Follow these patterns; do not invent new ones without coordinating first.
- **Section 9** is the process rules (branching, migrations, dependencies).
- **Section 10** is the explicit "do not touch" list.

Companion documents that you should also read:

- **`CLIENT_REQUIREMENTS.md`** : what the client wants the site to be.
- **`IMPLEMENTATION_PLAN.md`** : the tracks of work, ownership, and acceptance criteria.
- **`PROJECT_STATE.md`** : the exhaustive snapshot of the codebase at week 9 of the project. Use this as your reference for "what currently exists" before assuming.
- **`BRAND.md`** : UoA brand guidelines.
- **`DESIGN.md`** : visual / styling guidelines for new UI.

---

## 1. Ownership and current work

This is a six-person university capstone project. Two weeks remain until final delivery. Work has been carved into tracks (described in `IMPLEMENTATION_PLAN.md`). **Each track has a designated owner. Do not work on a track you do not own.**

### 1.1 Current track owners

| Track | Owner | What it covers |
| ----- | ----- | -------------- |
| A | Cam | Schema migrations and seed updates. Foundational. |
| B + C | Teammate 1 | Wire team/partners to DB; remove three hardcoded study pages. |
| E + F | Teammate 2 | Contact flow cleanup, donations removal, hide team emails. |
| D | Cam | Admin / CMS UI. The full admin surface. |
| I | Cam | Publications system (ORCID fetch, affiliation filter, CMS review, public archive). |
| G, H, J, K, L, M | TBD | Picked up after the above. Coordinate before starting. |

### 1.2 What "owning a track" means

If you own a track, you are the one making the technical decisions inside it and you push the code. Others do not push changes to files in your track without checking with you. If someone outside the track sees a problem in it, the right move is to flag it on the team chat, not to fix it themselves.

### 1.3 Cross-cutting files

A few files are shared across tracks. Anyone touching them must be deliberate:

- `prisma/schema.prisma` and `prisma/seed.ts`: schema and seed. **Only Cam edits these without coordination.** All schema changes happen in Track A's migration batch. If your work needs a new column or model, raise it; do not add one yourself.
- `src/middleware.ts`: auth gate. Do not modify unless you understand the JWT cookie flow.
- `src/lib/prisma.ts`: the Prisma client singleton. Do not modify.
- `src/lib/admin-session.ts`: JWT issue/verify. Do not modify.
- `src/components/layout/Navbar.tsx`: shared across every page. Multiple tracks need to change it (Track E removes Donations, Track L wires up search). Coordinate.
- `src/components/layout/Footer.tsx`: shared. Coordinate.
- `src/app/globals.css`: brand tokens. Do not add unrelated style rules here.
- `package.json`: see §9.4 on dependencies.

### 1.4 Branch hygiene

- One feature branch per track or per logical sub-task.
- Branch names: `feature/<track-letter>-<short-description>` or `fix/<short-description>`.
- Branches must keep their `.github/workflows/` files in sync with `main`, otherwise the OIDC validation on the Claude Code action fails. The fix pattern is `git checkout main -- .github/workflows/` then commit and push.
- PRs into `main` with a short description of what changed and which track it belongs to.

---

## 2. The non-negotiables

These rules are not up for discussion within the remaining time. Do not relitigate them.

1. **No team-member email addresses are visible on the team page, contact page, or studies index page.** The client raised this firmly; spam is a real problem. The only exception is per-study contact emails on individual study pages (those serve a different role).
2. **No social media links anywhere on the site.** HNU has minimal social presence and does not want links.
3. **No auto-translation of Chinese content.** Translations on study pages must be uploaded as verified text by HNU through the CMS. They are bound by an ethics-approval requirement.
4. **Bilingual content (English + Simplified Chinese) only applies to per-study text** (`Study.fullDescriptionEn/Zh`, `eligibilityEn/Zh`, `compensationEn/Zh`, `contactPhone`/`contactPhoneZh`). Do not add bilingual fields elsewhere in the schema.
5. **The site must work on mobile (390px wide minimum).** The client has not explicitly asked for this; it is assumed. The admin/CMS surface is desktop-only and that is fine.
6. **No new external dependencies without discussion.** See §9.4.
7. **No new schema migrations outside Track A.** If your work needs a new field, raise it on the team chat first.
8. **No work on the admin/CMS pages by anyone other than the admin/CMS track owner.** If you find a bug in admin code while doing other work, flag it; do not fix it. Same for publications.
9. **Do not add a JoinStudyForm-style duplicate contact form anywhere.** The single canonical contact form lives on `/contact`. Participants go to REDCap; everyone else uses the contact form.
10. **The CMS is intentionally not all-encompassing.** The head client is not technically confident. Only the surfaces listed in `CLIENT_REQUIREMENTS.md` §4 are editable; do not extend the admin UI to other things without checking.

---

## 3. Tech stack and architecture decisions

### 3.1 Stack at a glance

- **Framework**: Next.js 16.2 (App Router), React 19.2, TypeScript 5, Tailwind CSS v4.
- **Database**: SQLite via `better-sqlite3`. Prisma 7 ORM with the `@prisma/adapter-better-sqlite3` adapter.
- **Auth**: signed JWT cookie via the `jose` package. Single shared admin password from env.
- **Testing**: Vitest (Node project for API tests, Playwright/Chromium project for Storybook visual smoke tests).
- **Component dev**: Storybook 10, running on `localhost:6006`.

### 3.2 Why these choices

- **Next.js App Router**: it handles both the public site and the API routes in a single codebase, so we do not need a separate backend service.
- **SQLite + better-sqlite3 adapter**: Prisma 7 dropped the built-in SQLite engine and requires an explicit adapter. `better-sqlite3` is the production-grade synchronous SQLite driver. We use this in dev and there is no separate prod database; the prototype runs as a single instance.
- **JWT cookie auth**: simple, dependency-light, sufficient for a prototype with one admin password. We did not bring in NextAuth or similar because the scope does not need user accounts.
- **Hand-rolled validation in API routes**: we deliberately did not add `zod` or `valibot`. Each route has small local validator helpers (`asTrimmedString`, `isValidEmail`, `parseId`, etc.) defined at the top of the file. This keeps cognitive overhead low for a small team. **Do not add a validation library now**; the prototype is too far along.
- **Tailwind v4 with `@theme` in CSS**: brand tokens live in `globals.css` via `@theme inline`. No `tailwind.config.js`. Do not migrate to v3.
- **Inter as a local font**: served from `/public/fonts/` to avoid network dependency. Geist and Geist Mono are imported in `layout.tsx` but unused; they are dead code from `create-next-app` and can be removed in the bug-fix sweep.

### 3.3 Rendering model

Page-level files (`src/app/<route>/page.tsx`) are **server components by default**. They render on the server, can `await` data fetches, and ship no client-side JavaScript for their own logic. Components are marked `'use client'` only when they need:

- React state, refs, or effects.
- Event handlers (`onClick`, `onChange`, etc.).
- Browser-only APIs (`window`, `document`, `ResizeObserver`).

The reasoning: server components keep the bundle small, the markup ships fast, and they are simpler to reason about. If you find yourself adding `'use client'` to a component, double-check that you actually need state or effects. If you do not, leave it as a server component.

The current client components are: `Navbar`, `StudiesOverview`, `JoinStudyForm` (being deleted by Track E), `ContactEmailForm`, `MailingListSignup`, `StudyContent`. New components should default to server unless they need interactivity.

---

## 4. Data layer

### 4.1 Schema rules

The schema is at `prisma/schema.prisma`. The current models, their roles, and the constraints on each are documented in `PROJECT_STATE.md` §3. **Read that section before assuming anything about the schema.**

Rules:

- **Schema changes only happen in Track A's migration batch.** If your work needs a new field, raise it.
- **Every text column representing meaningful content has a paired bilingual `En`/`Zh` version only on `Study`.** Do not add `Zh` versions on other models; that is not what the client requires.
- **Composite indexes match query patterns.** `Study(isActive, order)`, `TeamMember(section, order)` and `(isVisible, order)`, `PartnerLogo(order)`. If you add a new query pattern, add the matching index.
- **Soft-hide vs lifecycle status:** the `Study` model has both `isActive: Boolean` and `status: String`. These are not the same thing. `status` is the lifecycle stage shown to the public (Recruiting / Active / Completed). `isActive` is whether the study is shown on the site at all. An admin can hide a study entirely with `isActive: false` without having to push it to Completed. Keep these semantics separate.

### 4.2 Why a string for `Study.status` rather than a Prisma enum

Prisma 7 does support enums on SQLite via the adapter, but the existing API route handlers use simple string allow-lists for similar fields (`category` on `ContactSubmission`, for example). For consistency we keep `status` as a string column with allowed values enforced in the API route (`"Recruiting" | "Active" | "Completed"`). TypeScript can still narrow the string via a union type at the application layer.

### 4.3 Prisma client

`src/lib/prisma.ts` exports a singleton client. It uses the `globalThis` stash so the Next dev server's hot reload does not leak connections. **Do not instantiate `new PrismaClient()` elsewhere.** Always import from `@/lib/prisma`.

### 4.4 Bilingual content handling

Per-study bilingual fields are paired columns (`fullDescriptionEn` / `fullDescriptionZh`, etc.). The dynamic study route (`src/app/studies/[slug]/page.tsx`) fetches the full record and passes both versions to `StudyContent.tsx`, which is a client component holding a language toggle (`'en' | 'zh'`). The toggle is local state, not URL-driven; if you need the choice to persist across pages, that is a future enhancement and not scoped now.

### 4.5 Why no autotranslation

This is worth restating because it is the kind of thing an AI agent might "helpfully" add. HNU is required to submit recruitment material translations to an ethics committee for approval. Auto-translating that text would violate the approval process. The CMS is the only place translated text enters the system; the front end never translates anything itself.

---

## 5. API layer

### 5.1 Route layout

Public read routes and admin routes live under `src/app/api/`:

- `src/app/api/<resource>/route.ts` and `[id]/route.ts`: public.
- `src/app/api/admin/<resource>/route.ts` and `[id]/route.ts`: admin, gated by middleware.
- `src/app/api/admin/auth/{login,logout}/route.ts`: auth.

Every admin route is matched by `src/middleware.ts` and requires a valid `admin_session` cookie. Unauthenticated requests get `401 { error: "Unauthorized" }`.

### 5.2 Route conventions

Established patterns to follow when adding a route:

- **Error envelope shape**: `{ error: string }`. Successes return either `{ ok: true }`, the data directly, or the created/updated row. Use status `201` for successful POST, `204` for successful DELETE, `400` for validation, `401` for unauthorized, `404` for not found, `500` for unexpected.
- **Trim string inputs.** Use a local helper `asTrimmedString` (or copy the pattern from existing routes).
- **Email validation regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Use this exact regex; do not invent variants.
- **ID parsing**: parse route param IDs as positive integers via a local `parseId` helper. Return `400 { error: "Invalid <resource> id." }` if it does not parse.
- **Allow-lists for string-enum fields**: declare the allowed values as a constant array in the route file, validate against it. Existing example: contact form categories in `/api/contact/route.ts`.
- **Multipart uploads**: use `request.formData()` (built into Next 16). Annotate the route with `export const runtime = "nodejs"`. The Edge runtime cannot do file I/O.
- **File upload validation**: MIME type whitelist, size limit (5 MB for images, 20 MB for PDFs), filename sanitisation via `replace(/[^a-zA-Z0-9._-]/g, "_")` prefixed with `Date.now()`. Existing patterns in `src/app/api/admin/team/route.ts` and `case-studies/route.ts`.
- **Disk file cleanup on delete**: when deleting a row whose `*Path` lives under `/uploads/`, also `unlink` the file. Wrap in try/catch and log a warning on failure; do not block the response.

### 5.3 Auth pattern

- Login (`POST /api/admin/auth/login`) compares plaintext password against `process.env.ADMIN_PASSWORD`. On match, signs a JWT (HS256, 7-day expiry, issuer/audience claims) using `process.env.ADMIN_SESSION_SECRET`, sets it as `admin_session` cookie with `httpOnly`, `secure` in production, `sameSite: "strict"`, `path: "/"`.
- Middleware verifies the cookie on every `/admin/*` and `/api/admin/*` request.
- Logout overwrites the cookie with `value: ""` and `maxAge: 0`.
- Do not introduce a separate "user" model. The prototype has one admin role.

### 5.4 Why no rate limiting today (and what to add)

There is no rate limiting on public endpoints yet. Track E adds basic protection: an in-memory IP-based rate limit and a honeypot field on both forms. The in-memory limit is acceptable because the app runs as a single instance for the prototype. If we ever deploy multi-instance, this needs to move to a shared store (Redis) but that is future work.

---

## 6. Frontend layer

### 6.1 Component organisation

- `src/components/layout/`: navbar, footer, page shells, shared subpage hero.
- `src/components/sections/`: page-level composition components (one per visual section). Most pages compose a handful of these.
- `src/components/team/`: team-page-specific components.
- `src/components/ui/`: shared low-level UI primitives. Currently only `Button`. Add to this folder when you make something genuinely reusable.
- `src/components/admin/` (Track D): admin shell and shared admin form primitives.

If you create a section that is one-off (used on one page), put it in `sections/` (or the page-specific folder if one exists). If it is used in multiple places, lift it to `layout/` or `ui/`.

### 6.2 Styling

- **Tailwind utility classes** are the primary styling mechanism. Use them inline on components.
- **Brand colour tokens** are declared in `src/app/globals.css` as CSS variables (`--uoa-waitemata: #0c0c48`, `--uoa-azure: #1f2bd4`, `--uoa-mahina: #00caef`). The recurring secondary navy `#0a4479` is not in the variables and is used as an inline value across many components. This inconsistency exists; do not introduce a third navy.
- **Use these colours**: `#0c0c48` for navbar, primary buttons, primary headings. `#0a4479` for body text, secondary headings, decorative dividers. `#eee` / `#eeeeee` for light grey section bands. Refer to the existing components for the right combinations rather than choosing.
- **Do not introduce new fonts.** Inter is the body font, loaded as local OTF files.
- **Rounded card pattern**: `rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] bg-white`. This is the dominant card shape; use it for new cards.
- **Hero gradient**: `linear-gradient(112deg, #092d65 0%, #06699b 50%, #02a8d0 100%)`. Exported as `SUBPAGE_HERO_GRADIENT` from `src/components/layout/SubpageHero.tsx`.
- **Navbar height constants**: `NAVBAR_HEIGHT = 180` and `UTILITY_BAR_HEIGHT = 40`. Use the exports, do not duplicate the numbers.

### 6.3 Page composition pattern

There are two page-shell patterns in the codebase:

- **`PageLayout`** (`src/components/layout/PageLayout.tsx`): wrapper used by the home page and the case-studies stub. Renders `<Navbar />`, a centred max-width main, and `<Footer />`.
- **Inline composition**: every subpage (`/about`, `/research`, `/team`, `/studies`, `/collaborations`, `/contact`) renders `<Navbar />`, the hero, `<main id="main-content">`, sections, and `<Footer />` directly. The reason: subpage heroes use `marginTop: -180px` to bleed up behind the navbar, which `PageLayout`'s wrapper would break.

For new pages, prefer the inline pattern unless the page does not have a hero. **Do not refactor existing pages to switch patterns** without coordinating.

### 6.4 Accessibility

The site has solid accessibility affordances already (skip-to-main link, ARIA on dropdowns, focus traps on the search overlay, semantic landmarks). New components should match this bar:

- Icon buttons need `aria-label`.
- Dropdown triggers need `aria-expanded`, `aria-haspopup`, `aria-controls`.
- Modal-style overlays need `role="dialog" aria-modal="true"` and a focus trap.
- Live status text (form success/error messages) needs `aria-live="polite"` or `role="alert"`.
- Decorative SVGs get `aria-hidden="true"`.

Storybook's a11y addon is configured but in `test: 'todo'` mode; violations surface but do not fail CI. Use it as a guide when developing components.

### 6.5 Shared `Button` component

`src/components/ui/Button.tsx`. Variants `primary | secondary | outline | ghost | danger`, sizes `sm | md | lg`. Supports `href` (renders an `<a>`), `onClick`, `disabled`, `isLoading`. **Use this for new buttons rather than hand-rolling another styled `<button>` element.** The codebase currently has many hand-rolled buttons; do not contribute to that pattern.

---

## 7. Admin / CMS architecture

The admin surface is being built fresh in Track D. Everything in `src/app/admin/` and `src/components/admin/` is owned by Cam. Do not add files in these paths if you are not on Track D.

### 7.1 Shell pattern

`src/app/admin/layout.tsx` is the shell: left sidebar with section links, top bar with logout, main content area for child routes. All admin pages render inside this shell.

### 7.2 Shared admin primitives

Form and list primitives live in `src/components/admin/`. The intent is that each per-entity page is a thin composition of primitives plus the entity-specific schema. Do not duplicate form-field markup across admin pages; if a primitive does not yet exist for what you need, add one.

### 7.3 Why a single shared password

The client is one organisation with shared editorial access. No user accounts are needed. JWT cookie auth is sufficient. Do not over-engineer this.

---

## 8. Publications system

Track I (publications) is owned by Cam. The full design is in `IMPLEMENTATION_PLAN.md` Track I and `CLIENT_REQUIREMENTS.md` §3.2. Key architectural facts:

- **The system is hybrid: ORCID fetch + affiliation filter + CMS review.** Approved publications are the persistent layer; the ORCID API is the source of candidates.
- **The affiliation filter is "HNU + Auckland".** A publication's affiliation text must mention `Human Nutrition Unit` or `HNU` AND `Auckland` to pass the filter. Case-insensitive. Word-boundary check on `HNU` to avoid false positives.
- **Refresh is admin-triggered, not automated.** A button in the admin UI runs the fetch.
- **De-duplication is by DOI.** The same publication can be returned via multiple team-member ORCID lookups; the unique key across team members is the DOI (with title+year as a fallback).
- **Publication.status:** `PendingReview` (new from refresh, awaiting admin) | `Approved` (visible on public page) | `Rejected` (hidden, will not be re-prompted on subsequent refreshes).

If you are not on Track I, **do not add publication-related code**. If you find a bug in the publications system while doing your assigned work, flag it.

---

## 9. Process rules

### 9.1 Coordination requirements

You must check with the team before:

- Adding a new model or column to `prisma/schema.prisma`.
- Adding a new external package (`npm install <anything>`).
- Modifying `src/middleware.ts`, `src/lib/prisma.ts`, `src/lib/admin-session.ts`.
- Modifying the Navbar or Footer in ways that affect other tracks.
- Creating new admin routes or admin pages if you are not on Track D.
- Creating new publication routes or publication pages if you are not on Track I.
- Deleting any file that other tracks might depend on.

"Check" means a message on the team chat with what you intend to do, and waiting for acknowledgement before pushing.

### 9.2 Scope discipline

If you find a bug or improvement opportunity while working on your assigned track, **flag it; do not silently fix it** unless:

- The fix is required to complete your track, AND
- The fix is small (a few lines), AND
- The fix does not touch a file in someone else's track.

Otherwise, write it down for the bug-fix sweep (Track J).

The reason: silent scope creep makes PRs hard to review, can introduce subtle conflicts with other in-flight work, and obscures what each track actually accomplished.

### 9.3 Pull request rules

- One PR per track or per logical sub-task.
- PR description names the track and lists the user-visible changes.
- The reviewer is someone other than the author.
- Do not merge your own PR without a review unless the team has agreed.
- Workflow files in `.github/workflows/` must match `main` on every branch (an OIDC validation quirk; if you see a Claude Code action failing on auth, this is usually why).

### 9.4 Dependencies

- **No new npm packages without raising it.** The current dependency list is intentional and minimal. The validation hand-rolling is intentional. The "no email sending" decision means no `nodemailer` or similar.
- Acceptable additions if needed for a track and discussed: a rate-limit utility (if implemented as a tiny utility you can also just write inline), `marked` or similar markdown renderer if the CMS needs it for rich text (open question).
- Not acceptable: validation libraries (zod, valibot, yup), an email library, a different ORM, a different auth library, a UI component library (shadcn, mui, etc.), a new CSS framework.

### 9.5 Migrations

The current migration history is small and clean. Track A is doing one batched migration that covers every new field needed across the project. **Do not run `prisma migrate dev` to create your own migration outside Track A**, because:

- A second migration on a branch that diverges from the Track A migration creates a hard-to-resolve conflict.
- Schema changes scattered across multiple PRs make the seed script unstable.

If you need a new schema field, message Cam and add it to Track A's migration.

### 9.6 Testing

- API tests live in `src/app/api/test/`. When you add or change a route, add or update its test.
- Vitest runs both an API project (Node) and a Storybook project (Playwright). Both should pass before merging.
- Storybook stories exist for `Footer`, `Navbar` (four variants), `SectionContainer`, `AudiencePathway`, `Button`. New shared UI components should get a story.

### 9.7 Visual verification

Use the Playwright MCP server in your dev environment to capture screenshots at both viewports (1440×900 desktop and 390×844 mobile) when you make UI changes. The mobile rendering is the most common source of regressions; do not declare a UI task complete without checking it.

---

## 10. Explicit do-not-touch list

These files / areas should not be modified by anyone outside the track that owns them. If you have a reason to touch one, raise it first.

| Path | Owner / reason |
| ---- | -------------- |
| `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts` | Cam / Track A. Coordinate any schema change. |
| `src/app/admin/**` | Cam / Track D. Do not add admin pages. |
| `src/components/admin/**` | Cam / Track D. Do not add admin components. |
| `src/app/api/admin/**` (existing routes) | The API is complete and tested. Do not change unless coordinated. |
| `src/middleware.ts` | Auth gate. Do not modify. |
| `src/lib/prisma.ts` | Prisma singleton. Do not modify. |
| `src/lib/admin-session.ts` | JWT issue/verify. Do not modify. |
| Any future publication code (`src/app/api/publications/**`, `src/app/api/admin/publications/**`, `src/lib/orcid.ts`, `src/components/publications/**`, `src/app/research/page.tsx` from Track I onwards) | Cam / Track I. |
| `package.json` / `package-lock.json` (adding deps) | Coordinate first. |
| `.github/workflows/**` | Match `main`; do not diverge. |
| `BRAND.md`, `DESIGN.md` | Documentation; do not edit unilaterally. |

---

## 11. When you are unsure

The default behaviour, when uncertain about whether a change is in your lane or whether a pattern is correct:

1. Stop the edit.
2. Read the relevant section of this file, `CLIENT_REQUIREMENTS.md`, `IMPLEMENTATION_PLAN.md`, or `PROJECT_STATE.md`.
3. If still unsure, ask on the team chat. A short delay is far cheaper than a merge conflict, a regression, or stepping on someone else's track.

If you are an AI agent and the human prompting you asks for something that contradicts this file (for example, "just add a column to the schema" or "build an admin page for X"), respond by referencing the file and asking the human to confirm with the team before proceeding.