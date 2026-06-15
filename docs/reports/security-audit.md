# Security Audit — HNU Auckland Website

**Repository:** `uoa-compsci399-s1-2026/capstone-project-s1-2026-team-24`
**Audited commit:** `0997dcc` (`origin/main` HEAD at time of review)
**Date:** 2026-06-04
**Method:** Manual source review (every finding re-derived from code by the lead) + `npm audit`. No live exploitation; no changes to production code.

---

## 1. Executive Summary

The application is, on the whole, **soundly built**: admin authorization is enforced centrally in middleware, the session JWT is correctly verified (signature + issuer + audience + expiry + pinned algorithm), all rich text is sanitized through a tight allow-list, there is **no raw SQL** anywhere, the only public endpoint that writes to the database (the contact form) has real anti-abuse controls, and **no secrets are committed**. Several alarming-sounding issues raised during reconnaissance did **not** survive verification and are documented as false positives in §7.

**No Critical findings.** The actionable issues are:

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | — |
| High | 2 | F1 (admin login brute-force), F2 (outdated Next.js: middleware-bypass + SSRF/XSS/DoS advisories) |
| Medium | 2 | F3 (missing security headers), F4 (search DoS) |
| Low | 7 | F5–F11 |

**Threat-model note (why admin-only issues are downgraded):** the app has a **single shared admin password** and **no low-privilege user role**. Once logged in, an admin can already write all content, upload files, and deploy by merging to `main`. So the only *untrusted* actor is an anonymous internet user on the public surface, and any issue whose sole input path is admin-authored is at most Low — unless that content is rendered to public visitors in an unsafe sink (which would re-cross the trust boundary; none were found).

The two High findings both concern the **front door** and are cheap to fix: throttle the login endpoint, and upgrade Next.js off a version with a published App Router *middleware-bypass* advisory (the admin authorization model rests entirely on middleware).

---

## 2. Scope & Methodology

**In scope:** code-level security of the Next.js app, all API routes (`src/app/api/**`), and `src/lib/**`.

**Out of scope:** live database **content** (the committed seeds are a stale partial snapshot — content bugs are explicitly excluded); third-party infrastructure (Render, Resend, ORCID/OpenAlex, translation vendors) beyond how this code calls it; and host-level DoS.

**Workstream coverage** (parallel review, then lead verification of every claim against the source):

| Workstream | Verified |
|---|---|
| (a) admin auth & session | `auth/login`, `auth/logout`, `src/lib/admin-session.ts`, cookie flags |
| (b) authz sweep of `/api/admin/**` | all 36 admin route files cross-checked against the `src/middleware.ts` matcher |
| (c) uploads & file handling | `src/lib/media-upload.ts`, media route, case-study & study PDF routes, how `public/uploads` is served |
| (d) XSS / injection / stored content | all 3 `dangerouslySetInnerHTML` sinks, `src/lib/sanitize.ts`, raw-SQL grep, `/api/search` |
| (e) CSRF / SSRF / contact form | SameSite cookie, `src/lib/orcid.ts`, OpenAlex/translate fetches, `src/lib/email.ts` |
| (f) headers / secrets / dependencies | `next.config.ts`, `NEXT_PUBLIC_*`, `.env` tracking, `npm audit` |

---

## 3. Threat Model (the calibration anchor)

- **Single shared admin password**; admins are fully trusted post-login. **No** per-user accounts, **no** role tiers.
- **Trust boundary:** the only untrusted actor is an anonymous internet user hitting the public surface — unauthenticated GET pages, `GET /api/search`, `POST /api/contact`, and `GET /api/test/*`. Everything under `/admin` and `/api/admin` is gated by middleware.
- **Hosting:** 512MB Render Starter, persistent disk, SQLite file DB; pages are mostly `force-dynamic`; the image optimizer is deliberately disabled (OOMs on 512MB).
- **Deployment:** merging to `main` deploys to production.

---

## 4. Severity Rubric (calibrated to this app)

- **Critical** — Remotely exploitable by an *unauthenticated* user **today**, leading to admin/RCE/full-DB compromise, working stored-XSS that runs in a public visitor's browser, or disclosure of the admin password / session signing key.
- **High** — Unauthenticated user can cause meaningful harm: realistic credential brute-force, reliable DoS of the 512MB instance, SSRF reaching internal/metadata endpoints from an unauthenticated path, or use of a framework version with a published advisory that breaks a primary security control.
- **Medium** — Defense-in-depth gaps with real-but-bounded impact (e.g. missing security headers with no working XSS vector), or unauthenticated issues of low impact/likelihood.
- **Low** — Best-practice deviations, hardening, or issues gated entirely behind the trusted admin with no crossover to an untrusted actor.

> **Trusted-admin downgrade rule:** an issue whose only input path is admin-authored content (stored XSS in an admin-only field, SSRF from an admin-validated DB value, a spoofed upload only an admin can perform) is at most **Low** — a logged-in admin already fully controls the system and there is no other privileged user to attack. Such items are recorded as hardening.

---

## 5. Findings Summary

| ID | Title | Severity | Status | Location |
|----|-------|----------|--------|----------|
| F1 | Admin login has no brute-force / rate limiting | **High** | Confirmed | `src/app/api/admin/auth/login/route.ts:26` |
| F2 | Outdated Next.js (`16.2.2`) — middleware-bypass + SSRF/XSS/DoS advisories | **High** | Confirmed | `package.json:38` |
| F3 | No HTTP security headers (CSP, X-Frame-Options, nosniff, …) | **Medium** | Confirmed | `next.config.ts:1-12` |
| F4 | No rate limiting on `/api/search` (DoS on 512MB) | **Medium** | Confirmed | `src/app/api/search/route.ts:9,166-245` |
| F5 | Image upload accepts MIME **or** extension and keeps the user's extension | **Low** | Confirmed | `src/lib/media-upload.ts:15-20`; `src/app/api/admin/media/route.ts:58` |
| F6 | Unauthenticated debug endpoints shipped to prod | **Low** | Confirmed | `src/app/api/test/{orcid,prisma}/route.ts` |
| F7 | IP rate-limit key derived from spoofable `X-Forwarded-For` | **Low** | Confirmed | `src/app/api/contact/route.ts:35-47` |
| F8 | ORCID id reaches fetch path with only `.trim()` (defense-in-depth) | **Low** | Confirmed | `src/lib/orcid.ts:164,198,144` |
| F9 | Google translate provider puts API key in query string (conditional) | **Low** | Confirmed | `src/lib/translate/provider.ts:79-80` |
| F10 | `npm audit` residual (dev-tooling criticals + transitive moderates) | **Low** | Triaged | `package.json` / lockfile |
| F11 | Production secret hygiene + per-instance in-memory rate limiter | **Low/Info** | Advisory | `src/lib/rate-limit.ts`; deploy config |

---

## 6. Detailed Findings

### F1 — Admin login has no brute-force / rate limiting · **High** · Confirmed
- **Location:** `src/app/api/admin/auth/login/route.ts` (whole `POST` handler; comparison at `:26`)
- **Category:** Broken authentication
- **Exploit scenario:** The entire authentication surface is a **single shared password**. The login handler does no throttling — there is no `checkRateLimit` call, no lockout, no delay (contrast the contact route, which *does* call the limiter at `src/app/api/contact/route.ts:74,149`). An anonymous attacker can script unlimited `POST /api/admin/auth/login` requests with `{ "password": "…" }` guesses. A successful guess yields a 7-day session cookie and full admin control: editing all site content, uploading files to the server, managing team/publications, and triggering ORCID sync.
- **Evidence:**
  ```ts
  // src/app/api/admin/auth/login/route.ts:26
  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  ```
  No rate-limit import or call exists in the file.
- **Concrete fix:**
  1. Reuse the existing limiter (`src/lib/rate-limit.ts`): at the top of `POST`, derive the client IP **from a trusted source** (see F7) and `const rl = checkRateLimit(\`admin-login:${ip}\`)`; return `429` with `Retry-After` when `!rl.allowed`. Consider a stricter window for login than the contact form's 5/10min, and an incremental backoff.
  2. Replace `!==` with a constant-time comparison (`crypto.timingSafeEqual` over equal-length buffers) — defense-in-depth (see false-positive note in §7; the timing leak alone is not practically exploitable, but it's trivial to harden).
  3. Operationally: ensure `ADMIN_PASSWORD` in production is high-entropy (see F11) — rate limiting buys time, password strength is the actual barrier.
- **Residual risk:** Rate limiting is per-instance and IP-keyed; pair with F7 (don't trust spoofable IPs) and a strong password.

### F2 — Outdated Next.js with published middleware-bypass / SSRF / XSS / DoS advisories · **High** · Confirmed
- **Location:** `package.json:38` → `"next": "16.2.2"` (and `eslint-config-next: 16.2.2`)
- **Category:** Vulnerable dependency / broken access control
- **Exploit scenario:** `npm audit` flags the installed Next.js as vulnerable across a long list of advisories. The most serious for *this* app are the **App Router Middleware / Proxy bypass** advisories — because **100% of admin authorization is enforced in `src/middleware.ts`** (matcher `"/api/admin/:path*"`, returning `401` for unauthenticated admin API calls). A middleware-bypass primitive means an anonymous attacker could potentially reach `/api/admin/**` route handlers *without* a valid session cookie, defeating the entire access-control model. The same advisory set includes SSRF (via WebSocket upgrades), XSS (App Router CSP-nonce handling; `beforeInteractive` scripts), multiple DoS vectors, and cache poisoning.
- **Evidence (`npm audit`, abridged):**
  ```
  next  9.3.4-canary.0 - 16.3.0-canary.5   Severity: high
    - Middleware / Proxy bypass in App Router applications …  GHSA-26hh-7cqf-hhc6
    - Middleware / Proxy bypass through dynamic route parameter injection  GHSA-492v-c6pp-mqqv
    - Middleware / Proxy bypass in App Router applications via segment-prefetch routes  GHSA-267c-6grr-h53f
    - server-side request forgery in applications using WebSocket upgrades  GHSA-c4j6-fc7j-m34r
    - cross-site scripting in App Router applications using CSP nonces  GHSA-ffhc-5mcf-pf4q
    - Denial of Service with Server Components (+ connection exhaustion, Image Optimization API) …
    fix available via `npm audit fix --force`  → next@16.2.7
  ```
- **Concrete fix:** Upgrade Next.js to a patched release (the audit indicates `16.2.7`; bump `next` and `eslint-config-next` to `^16.2.7` or newer, loosening the exact `16.2.2` pin), `npm install`, run `npm run verify`, and redeploy. This also clears the transitive `postcss` advisory. Re-run `npm audit` afterward.
- **Severity rationale:** Ranked **High**, not Critical, because the specific bypass was **not reproduced** against this deployment and a patched version is one bump away. Treat as urgent — if a public PoC applies to the deployed version/config, the impact is unauthenticated admin access (Critical-level).

### F3 — No HTTP security headers · **Medium** · Confirmed
- **Location:** `next.config.ts:1-12` (only `images: { unoptimized: true }`; no `async headers()`). No `Content-Security-Policy` / `X-Frame-Options` anywhere in the repo.
- **Category:** Security misconfiguration (defense-in-depth)
- **Exploit scenario:** With no `X-Frame-Options`/`frame-ancestors`, the `/admin` UI can be framed by a malicious page and an authenticated admin clickjacked into destructive actions. With no CSP, any auxiliary script-injection vector (e.g. the Next.js XSS advisories in F2, or a same-origin upload from F5) executes unconstrained. With no `X-Content-Type-Options: nosniff`, browsers may MIME-sniff uploaded files.
- **Concrete fix:** Add an `async headers()` to `next.config.ts` applying to all routes:
  ```ts
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    }];
  }
  ```
  **CSP caveat:** add `Content-Security-Policy` too, but note the homepage hero ships an **inline** `<script>` at `src/components/sections/HomepageHero.tsx:224` — a strict `script-src 'self'` would break it. Externalize that script (or load it via `next/script`) and serve a strict nonce-based CSP, rather than weakening the policy with `'unsafe-inline'`. (The script is a static literal with no user data, so it isn't itself an injection vector — it only matters for CSP compatibility.)

### F4 — No rate limiting on `/api/search` (DoS) · **Medium** · Confirmed
- **Location:** `src/app/api/search/route.ts` — `export const dynamic = "force-dynamic"` (`:9`); four parallel `prisma.*.findMany` (`:166-245`) including a `LIKE` scan over `page.publishedContent` (`:229`); recursive JSON walk `collectText`/`blocksToText` over up to 6 pages (`:55-102`). No `checkRateLimit`.
- **Category:** Denial of service
- **Exploit scenario:** Every request is uncached (`force-dynamic`) and, per call, runs four DB scans plus a recursive walk of admin-authored block JSON. An anonymous attacker scripting a burst of concurrent `GET /api/search?q=…` requests (each 2–100 chars) can drive sustained CPU/IO/memory load on the 512MB instance, degrading or downing the site for everyone — cheaply and without authentication.
- **Evidence:** handler is a plain `GET` with input length checks (`q.length < 2` rejected `:154`; `> 100` rejected `:158`) and small `take` limits, but **no per-IP throttle**.
- **Concrete fix:** Apply `checkRateLimit(\`search:${ip}\`)` (trusted IP per F7) returning `429`; optionally add a small in-memory LRU cache of recent `q → results` with a short TTL to absorb repeats. The existing length caps and `take` limits remain useful mitigants.

### F5 — Image upload accepts MIME **or** extension and preserves the user's extension · **Low** · Confirmed
- **Location:** `src/lib/media-upload.ts:15-20` (`isAllowedImage` uses `||`); `src/app/api/admin/media/route.ts:58` (stored name keeps the original extension); served statically from `public/uploads/media/`.
- **Category:** Stored XSS via file upload (admin-only)
- **Exploit scenario:** `isAllowedImage` returns true if **either** the MIME matches an image type **or** the filename extension does. `sanitizeFileName` only strips characters outside `[A-Za-z0-9._-]`, so a dotted extension survives. An authenticated admin (or anyone who has hijacked an admin session — see F2/F3) can upload a file with `Content-Type: image/png` (passes the MIME branch) but named `evil.html` containing `<script>…`. It is stored as `/uploads/media/<ts>-evil.html` and served by the static handler as `text/html` at the **site origin** → persistent same-origin XSS. (`X-Content-Type-Options: nosniff` does *not* help here, because the file legitimately carries a `.html` extension.)
- **Evidence:**
  ```ts
  // src/lib/media-upload.ts:16-19
  return (
    /^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)
  );
  // src/app/api/admin/media/route.ts:58
  const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  ```
- **Concrete fix:** Require **both** MIME *and* extension to be in the allow-list (`&&`, not `||`); derive the stored extension from a fixed map of the validated MIME type instead of the user's filename; and/or verify magic bytes (the route already imports `image-size`, which can confirm the bytes are a real raster image). Optionally serve uploads through a route that sets a safe `Content-Type`/`Content-Disposition`.
- **Severity rationale:** Upload is admin-gated and admins are trusted ⇒ **Low**. Listed because it is a genuine validation bug and a stored-XSS *pivot* if an admin session is ever compromised. The PDF routes do this correctly — they require MIME **and** extension (`src/app/api/admin/case-studies/route.ts:62-65`).

### F6 — Unauthenticated debug endpoints shipped to production · **Low** · Confirmed
- **Location:** `src/app/api/test/orcid/route.ts:4-7`; `src/app/api/test/prisma/route.ts:4-12` (neither path starts with `/admin` or `/api/admin`, so `src/middleware.ts` lets them through unauthenticated).
- **Category:** Information disclosure / unnecessary attack surface
- **Exploit scenario:** `GET /api/test/orcid` makes the server perform an outbound ORCID API call (for a **hardcoded** id — no attacker input, so no SSRF) on every hit; an anonymous user can repeat it to generate outbound traffic / trip ORCID rate limits / waste resources. `GET /api/test/prisma` returns `prisma.study.count()`, leaking a single aggregate count and confirming DB connectivity (low-sensitivity recon).
- **Concrete fix:** Delete both before production, or move them under `/api/admin` (middleware-gated), or guard with `if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 })`.

### F7 — IP rate-limit key derived from spoofable `X-Forwarded-For` · **Low** · Confirmed
- **Location:** `src/app/api/contact/route.ts:35-47` (`getClientIp`)
- **Category:** Broken anti-automation
- **Exploit scenario:** `getClientIp` takes the **leftmost** value of `X-Forwarded-For` (`forwardedFor.split(",")[0]`). On a typical append-style proxy chain the leftmost entry is client-supplied, so an attacker can send a rotating `X-Forwarded-For` header to land in a fresh rate-limit bucket each request, bypassing the 5/10-min contact throttle (spam). The same `getClientIp` pattern would undermine the F1 (login) and F4 (search) throttles if reused as-is. Conversely, if the proxy header is absent, all clients collapse to the `"unknown"` bucket (one shared global limit).
- **Concrete fix:** Derive the client IP from a **trusted** position. Confirm Render's `X-Forwarded-For` semantics; if the platform *appends* the real client IP, take the right-most hop the platform added (or a platform-provided trusted header) rather than the raw leftmost value, for any security-relevant decision.
- **Severity rationale:** Contingent on Render's proxy behaviour and only *weakens* (doesn't remove) throttling ⇒ **Low**, but fix it as part of F1/F4 so those throttles are effective.

### F8 — ORCID id reaches the fetch path with only `.trim()` · **Low** · Confirmed
- **Location:** `src/lib/orcid.ts:164,198` (`orcidId.trim()` → path `/${cleanOrcidId}/works`) → `fetch(\`${ORCID_API_BASE_URL}${path}\`)` (`:144`). `isValidOrcidId` exists (`:112`) but is **not** called on the fetch path.
- **Category:** SSRF / request-tampering (defense-in-depth)
- **Exploit scenario:** The admin sync passes the stored `orcidId` to the fetch helpers, which only trim it. A malformed value containing path characters could manipulate the request path. **Mitigated today** because: (a) the value is validated against `ORCID_ID_PATTERN` at every *write* boundary (admin team create/update), so a `/`, `:` or `@` cannot be stored; (b) the base host is fixed, so path-traversal stays on `pub.orcid.org` (same host, public API — not cross-host SSRF); and (c) the only actor who could author it is the trusted admin.
- **Concrete fix:** Call `isValidOrcidId(orcidId)` at the top of `fetchOrcidWorksSummary` / `fetchOrcidWorkDetail` (or in the sync loop) and reject early — belt-and-suspenders against a future import/migration/direct DB write that skips the write-time check.

### F9 — Google translate provider sends API key in query string · **Low** · Confirmed (conditional)
- **Location:** `src/lib/translate/provider.ts:79-80` (`url.searchParams.set("key", this.key)`)
- **Category:** Secret exposure (conditional)
- **Exploit scenario:** *Only if the Google provider is enabled.* Query-string secrets are commonly captured by intermediary/proxy/server logs. There is **no client exposure** (the module is `server-only`, HTTPS). Currently inert: the default provider is **Azure** (header auth, `:54`), translation is **off** by default (`TRANSLATE_API_KEY=""`, `getProvider()` returns `null` at `:136-137`), and translations run at publish/warm time, not at view time.
- **Concrete fix:** If Google is ever enabled, prefer header-based auth or ensure the key is scrubbed from logs. Otherwise no action.

### F10 — `npm audit` residual (triaged) · **Low** · Triaged
- **Summary:** `npm audit` reports **13 vulnerabilities (4 critical, 2 high, 7 moderate)**. Triage by *production* exposure:
  - **The 4 "critical" are dev-only.** `@vitest/browser`, `vitest`, `@vitest/coverage-v8`, `@vitest/browser-playwright` (GHSA-2h32-95rg-cppp, vitest browser-mode inline-script) are **devDependencies** — test tooling, never in the production bundle. Real-world risk ≈ none.
  - **Production-relevant:** `next` (→ **F2**, the real issue) and its transitive `postcss` (XSS in CSS stringify — fixed by the F2 bump).
  - **High (transitive):** `fast-uri` (path traversal / host confusion) — `npm audit fix` (non-breaking).
  - **Moderate (mostly dev/CLI):** `hono` + `@hono/node-server` (transitive via `@prisma/dev` → the Prisma CLI, dev tooling), `ws` (uninitialized memory disclosure), `brace-expansion` (ReDoS, via ESLint tooling).
- **Concrete fix:** Apply F2 (next bump) to clear `next`+`postcss`; run `npm audit fix` for the non-breaking transitive items; re-run `npm audit`. Do **not** be alarmed by the raw "4 critical" count — they are test-tooling advisories with no production surface.

### F11 — Production secret hygiene + per-instance rate limiter · **Low/Info** · Advisory
- **Secrets are clean in the repo** (see §7): `.env` is gitignored and only `.env.example` (placeholders) is tracked. The single `NEXT_PUBLIC_*` var is `NEXT_PUBLIC_SITE_URL` (a URL, not a secret).
- **Deploy-time actions:** ensure production sets a **high-entropy `ADMIN_SESSION_SECRET`** and a **strong `ADMIN_PASSWORD`** as Render environment variables (not the `change-me` / `replace-with-a-long-random-string` placeholders). A weak `ADMIN_SESSION_SECRET` lets an attacker forge the HS256 session JWT and bypass login entirely; a weak `ADMIN_PASSWORD` makes F1 trivial.
- **Rate limiter** (`src/lib/rate-limit.ts`) is in-memory and per-instance: it resets on restart/redeploy and would not be shared across horizontally-scaled instances. Acceptable on a single Starter instance — note the limitation if scaling later.

---

## 7. Considered & Dismissed (False Positives)

Recorded so they are not re-raised. Each was re-checked against the source.

| Flag raised | Verdict | Why |
|---|---|---|
| `.env` committed with secrets | **False positive** | `git ls-files` lists only `.env.example`; `git check-ignore` confirms `.env` is ignored (`.gitignore:42-43`, `!.env.example`). `.env.example` holds placeholders only (`ADMIN_PASSWORD="change-me"` `:19`, `ADMIN_SESSION_SECRET="replace-with-a-long-random-string"` `:22`, empty API keys). |
| Non-constant-time password compare = **Critical** | **Downgraded** (hardening, folded into F1) | A remote timing side-channel against a high-entropy shared secret over the public internet is not practically exploitable. Still worth `timingSafeEqual` for hygiene. |
| Stored XSS in study prose (`body`/`bodyZh`) | **Safe** | Both override and template paths run `sanitizeBlockContent(b.type, …)` (`resolve-study-layout.ts:57`); `studyProse.body`/`bodyZh` are declared `richText` (`registry.ts:642,644`), so the exact fields rendered with `dangerouslySetInnerHTML` (`StudyBlocks.tsx:249`) are the fields sanitized. |
| Search snippet → XSS | **Safe** | Snippets/titles render as JSX **text** children (`Navbar.tsx:982,986`), which React escapes; the server also strips HTML (`route.ts:76-87`); result `href`s pass through `getSafeHttpUrl`, which returns only `http`/`https` (`safe-url.ts:13`). |
| `sanitize.ts` allow-list too permissive | **Safe** | Tight allow-list (`sanitize.ts:9-36`): structural/inline tags only (no `script`/`style`/`img`/`iframe`), attributes limited to `a[href,target,rel]`, schemes `http`/`https`/`mailto`/`tel` (no `javascript:`/`data:`), and `rel="noopener noreferrer"` forced on links. |
| Contact `replyTo` CRLF / header injection | **Safe** | `isValidEmail` (`contact/route.ts:27`) rejects whitespace incl. CR/LF; Resend takes structured params (`email.ts:73-79`) and the body is plain text — no header smuggling. |
| ORCID / OpenAlex / translate **SSRF** | **Downgraded** (F8/F9) | ORCID id validated at the write boundary; OpenAlex/translate use fixed hosts with query-encoded params; admin-only; translation off by default. No cross-host SSRF reachable by an unauthenticated user. |
| Raw SQL injection | **None found** | No `$queryRaw`/`$executeRaw`/`*Unsafe` anywhere in `src/` (grep: no matches). All access is via the Prisma ORM. |
| Dependencies "current / fine" | **Incorrect** (→ F2/F10) | `npm audit` shows Next.js carries published advisories; see F2. |

---

## 8. Verified-Secure Controls (positives)

- **Centralized authorization.** `src/middleware.ts` gates `/admin` and `/api/admin` via `matcher: ["/admin/:path*", "/api/admin/:path*"]` (`:44-46`), returning `401` JSON for unauthenticated admin API calls (`:33-35`) and redirecting pages to login. Only `/admin/login` and `/api/admin/auth/*` are public (`:15-16`). All 36 admin route files sit under the matcher — **no unguarded admin route was found**. *(Integrity of this control depends on the Next.js version — see F2.)*
- **Session JWT.** `jose` HS256 with issuer + audience verified, **algorithm pinned** (`algorithms: ["HS256"]`, preventing alg-confusion / `none`), 7-day expiry, and a required-or-throw secret (`src/lib/admin-session.ts:10-48`).
- **Cookie / CSRF.** Session cookie is `httpOnly`, `sameSite: "strict"`, `secure` in production, `path: "/"` (`login/route.ts:33-41`). SameSite=Strict provides strong CSRF protection for cookie-authenticated admin mutations — no separate CSRF token is required.
- **No raw SQL** — Prisma ORM throughout (parameterized).
- **The only public endpoint that writes to the database is `POST /api/contact`**, with honeypot (`:64`), time-trap (`:69`), IP + email rate limiting (`:74,149`), a category allow-list (`:113-122`), and length/URL caps. (See F7 about IP keying.) The other public `POST`s — `/api/admin/auth/login` and `/logout` (`middleware.ts:15-16`) — only set/clear the session cookie and write nothing to the DB; login's missing throttle is **F1**.
- **Uploads:** SVG is deliberately excluded (`media-upload.ts:14`), filenames are sanitized to `[A-Za-z0-9._-]` (no path traversal — files cannot escape `uploads/`), and the PDF routes require MIME **and** extension.
- **Secrets:** nothing sensitive is committed, and no secret reaches the client bundle.

---

## 9. Appendix

**Key dependency versions (`package.json`):** `next 16.2.2` (→ F2), `react 19.2.4`, `@prisma/client 7.7.0`, `better-sqlite3 ^12.9.0`, `jose ^6.2.2`, `sanitize-html ^2.17.4`, `resend ^6.12.4`.

**`npm audit` summary at audit time:** 13 vulnerabilities — 4 critical (all `vitest` browser-mode devDependencies), 2 high (`next`, `fast-uri`), 7 moderate (`postcss`, `hono`, `@hono/node-server`, `ws`, `brace-expansion`, …). See F2 and F10.

**Tools:** manual source review; `npm audit`; `git ls-files` / `git check-ignore` for secret-tracking verification. No live exploitation was performed.

**Remediation priority:** F1 and F2 first (the front door), then F3 and F4, then the Low items as hardening. None of the fixes should be merged to `main` without review, since merging deploys to production.
