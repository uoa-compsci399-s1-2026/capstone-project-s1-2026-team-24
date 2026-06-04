# Dependency & Configuration Audit

*Read-only review of the HNU Auckland site's dependencies and build/tooling configuration (Next.js 16 · React 19 · Prisma 7 / better-sqlite3 · Tailwind v4 · Node 22.17.1 on Render). Produced 2026-06-04. **Report only — no version bumps or config changes were applied;** every fix below is a recommendation for the team to action deliberately. Sibling to [`architecture-audit.md`](./architecture-audit.md), which covers code/architecture risk. There is no CI (Actions are blocked org-wide by billing — see that report's §10), so `npm run verify` (`tsc --noEmit && eslint && vitest run --project api`) plus a build is the merge gate, and **merging to `main` deploys production**.*

## Snapshot

| Metric | Value | Note |
|---|---|---|
| Direct dependencies | **19 prod · 24 dev** | `package.json` |
| `npm audit` | **13** (4 critical · 2 high · 7 moderate) | **after triage: 1 genuinely prod-facing (`next`)** — see §1 |
| Outdated packages | **35** | almost all in-range patch/minor; no forced majors |
| Unused dependencies | **0** | every dep has an import or CLI/config path |
| Duplicate majors (core) | **0** | `next`/`react`/`prisma`/`better-sqlite3`/`typescript` each single-version |
| Lockfile | **v3, healthy** | registry pinned via `.npmrc`; "extraneous" WASM packages are benign (§3) |
| Node pin in-repo | **none** | host pins `22.17.1` in Render only; no `engines`/`.nvmrc` (§4) |
| Pinning | 4 exact (`next`,`react`,`react-dom`,`eslint-config-next`) + caret rest + 0 tilde | sound (§3) |

Severity: 🔴 high · 🟠 medium · 🟡 low · ⚪ noise (no action). "Prod runtime" = what `next start` serves (the app + `@prisma/client` + the better-sqlite3 adapter + `jose`/`sanitize-html`/`resend`/`image-size`); everything else (storybook, vitest, playwright, eslint, the `prisma` CLI, tsx, vite) is dev/build tooling that never ships.

---

## 1. `npm audit` — real vs noise

`npm audit` reports **13** flagged packages. Traced to source (`npm ls`), they collapse into four groups, and **only one (`next`) is reachable in the production runtime**:

| Package(s) | Sev | Source path | Reaches prod? | Verdict |
|---|---|---|---|---|
| `@vitest/browser`, `@vitest/browser-playwright`, `@vitest/coverage-v8`, `vitest` | 🔴 critical ×4 | direct dev deps + `vitest` | **No** — browser test mode only | Patch-bump within range → `4.1.8` |
| `next` | 🟠 high/mod (12 advisories) | direct prod dep | **Yes** | Bump `16.2.2 → 16.2.7` (deliberately) |
| `fast-uri` | 🔴 high | `prisma → @prisma/dev → @prisma/streams-local → ajv → fast-uri` | **No** — Prisma dev CLI | No action |
| `prisma`, `@prisma/dev`, `@hono/node-server`, `hono` | 🟠 moderate ×4 | `prisma → @prisma/dev → (@hono/node-server, hono)` | **No** — Prisma dev CLI | No action |
| `postcss` | 🟠 moderate | `next`/`@tailwindcss/postcss`/`vite`/`sanitize-html` | build-time (one minor runtime path) | Lockfile refresh → ≥`8.5.10` |
| `brace-expansion` | 🟠 moderate | storybook vite-plugin + `typescript-eslint` (`glob`/`minimatch`) | **No** — dev/build | Lockfile refresh → ≥`5.0.6` |
| `ws` | 🟠 moderate | `@vitest/browser`, `storybook` | **No** — dev/test | Cleared by the vitest bump |

> ⚠️ **Do not run `npm audit fix --force`.** Its proposed "fixes" include a **downgrade of `prisma` to v6** (a major regression for this Prisma-7 codebase) and a `next` change — both wrong here. Apply the targeted bumps below instead.

### 🟠 `next` — the one prod-facing fix (recommend 16.2.2 → 16.2.7)

`next@16.2.2` carries 12 advisories. `next` and `eslint-config-next` are both exact-pinned to `16.2.2`, so bump them **together** to `16.2.7`. Reachability against *this* app:

- **GHSA-26hh-7cqf-hhc6 — App-Router middleware/proxy bypass (high).** Most relevant: the app gates `/admin/*` in `src/middleware.ts`, so a middleware bypass is the advisory worth caring about here.
- **GHSA-q4gf-8mx6-v5v3 / GHSA-8h8q-6873-q5fj / GHSA-mg66-mrh9-m8jx — DoS via Server/Cache Components (high).** The app is Server-Component-heavy; availability impact on a low-traffic capstone site is limited but real.
- **GHSA-c4j6-fc7j-m34r — SSRF via WebSocket upgrades (high, CVSS 8.6).** Low reachability — the app doesn't expose WebSocket upgrades — but the fix is free.
- **GHSA-h64f-5h5j-jqjh — Image-Optimization-API DoS (moderate).** ✅ **Already neutralized** by `images.unoptimized: true` in `next.config.ts`: with the optimizer off, the vulnerable endpoint isn't served. A deliberate host-constraint choice that doubles as a security mitigation.
- GHSA-ffhc-5mcf-pf4q / GHSA-gx5p-jg67-6x7h (XSS via CSP nonces / `beforeInteractive`) — low reachability (the app uses neither pattern with untrusted input).

**Recommendation:** bump to `16.2.7`, then run `npm run verify` **and** `npm run build` before merging (no CI + prod-deploys-on-merge). Not an emergency for a low-traffic site, but it clears the only prod-reachable advisories — schedule it.

### 🔴→ low-in-practice: the 4 "criticals" are dev/test only

All four critical rows are the **same** advisory — **GHSA-2h32-95rg-cppp** (`@vitest/browser` serves an unsanitized `otelCarrier` query param as an inline script), affecting `4.0.17–4.1.5`. It is reachable **only in Vitest browser mode** (the `storybook` test project, Playwright/Chromium) and **requires user interaction**; it is never in the production runtime nor in the `api` project that `npm run verify` gates (node env). Installed `4.1.4`; the fix `4.1.8` is **within the existing `^4.1.4` range**, so `npm update vitest @vitest/browser-playwright @vitest/coverage-v8` clears all four (and the `ws` moderate) with **no `package.json` edit**. Severity is "critical" by CVSS, but real-world exposure for this repo is low — still worth the free patch.

### ⚪ Noise: the Prisma dev-CLI chain (5 of 13 — not prod-reachable)

`fast-uri` (high) and `prisma`/`@prisma/dev`/`@hono/node-server`/`hono` (4× moderate) **all** descend from `prisma → @prisma/dev@0.24.3` — Prisma's local dev/CLI tooling (the `prisma` package's dev server). `npm audit` even flags `prisma` itself as a **direct** moderate, which looks alarming, but it's solely because of this dev subtree. The production runtime imports `@prisma/client` + `@prisma/adapter-better-sqlite3` and **never loads `@prisma/dev`/`hono`**. No action; these clear on a future Prisma 7.x bump (try `prisma`/`@prisma/client`/`@prisma/adapter-better-sqlite3` → `7.8.0`).

### 🟡 Transitive, fixable by a plain lockfile refresh (no `package.json` change)

`postcss` resolves to `8.5.8`/`8.4.31` (advisory GHSA-qx2v-qp2m-jg93, XSS in CSS stringify, `<8.5.10`); it's overwhelmingly **build-time** (next/tailwind/vite), with one low-likelihood runtime path via `sanitize-html`. `brace-expansion` (`5.0.5`, GHSA-jxxr-4gwj-5jf2) comes via storybook's vite plugin and `typescript-eslint`. Both parents already allow the patched ranges, so `npm update postcss brace-expansion` lifts them to ≥`8.5.10` / ≥`5.0.6` without editing `package.json`.

---

## 2. Outdated & version posture

35 packages are behind, but the posture is healthy — almost everything is an **in-range** patch/minor, and the four exact-pinned packages are intentionally held. Highlights:

| Package | Current | Target | Class | Note |
|---|---|---|---|---|
| `next`, `eslint-config-next` | 16.2.2 | **16.2.7** | patch | security (§1); bump in lockstep |
| `vitest`, `@vitest/*` | 4.1.4 | **4.1.8** | patch | security (§1); in-range |
| `@prisma/client`, `prisma`, `@prisma/adapter-better-sqlite3` | 7.7.0 | 7.8.0 | minor | DB layer; may also retire §1 dev-chain noise |
| `@tiptap/*` | 3.23.6 | 3.25.0 | minor | admin rich-text editor |
| `storybook` + addons | 10.3.5 | 10.4.2 | minor | dev-only |
| `@types/node` | 20.19.37 | **`^22`** | range | ⚠️ host runs **Node 22.17.1** but types are `^20` — widen to `^22` (types-only, low risk) |
| `tailwindcss`/`@tailwindcss/postcss` | 4.2.2 | 4.3.0 | minor | |
| `jose`, `better-sqlite3`, `vite`, `tsx`, `playwright`, `@types/react` | — | patch/minor | patch | low-risk in-range |
| `eslint` | 9.39.4 | ~~10.4.1~~ | **hold** | major; `eslint-config-next@16` targets ESLint 9 |
| `typescript` | 5.9.3 | ~~6.0.3~~ | **hold** | major; defer to a deliberate upgrade |
| `@types/node` (latest) | — | ~~25.x~~ | **hold** | match the host (22), not newest |

---

## 3. Pinning, lockfile & registry

- **Pinning is sound.** Four exact pins on the framework spine (`next`, `react`, `react-dom`, `eslint-config-next`) give reproducible builds where it matters most; carets elsewhere; zero loose tildes. Keep `next` and `eslint-config-next` moving together (both `16.2.x`).
- **Lockfile is healthy.** `lockfileVersion: 3`; core packages dedupe to single versions; `.npmrc` pins the official npm registry (`registry=https://registry.npmjs.org/`) — a deliberate fix (commit #167) that stops a contributor's mirror config from poisoning `package-lock.json` and breaking `npm ci` on Render / cloud sessions. Keep it.
- **The "extraneous" WASM packages are a false alarm.** `npm ls` labels `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util` as extraneous, but they are **declared `optional`/`dev` deps in `package-lock.json`** — napi WASM fallbacks pulled by dev tooling. This is **not** lockfile drift; **do not** run `npm prune`/`npm ci --omit=optional` to "clean" them (a reinstall just re-adds them). `npm ci` is the formal sync check.

---

## 4. Node engines vs the host pin (🟠)

The runtime is pinned to **`NODE_VERSION=22.17.1` in Render's dashboard only** — nothing in the repo records it. There is no `engines` field, no `.nvmrc`/`.node-version`/`.tool-versions`, and no `packageManager` field. With no CI to catch a version mismatch, a contributor on Node 20 (which `@types/node: ^20` currently implies) can build locally yet hit different behavior than prod.

**Recommendation:**
- Add `.nvmrc` containing `22.17.1` (nvm/Volta/fnm read it; non-enforcing).
- Add a **permissive** `engines` to `package.json` — `"engines": { "node": ">=22.17.1" }`. Keep it a floor, **not** an exact pin (`"22.17.1"` would make `npm install` error for anyone on `22.17.2`+).
- Pair with widening `@types/node` to `^22` (§2) so the types match the runtime.

---

## 5. Unused / duplicate dependencies

- **No unused dependencies.** Every prod dep has a real import (`jose`→`src/lib/admin-session.ts`, `resend`→`src/lib/email.ts`, `image-size`→`src/lib/image-dimensions.ts`, `sanitize-html`→`src/lib/sanitize.ts`, `server-only` across 7 lib modules, `@dnd-kit/*` + `@tiptap/*` in admin UI); every tool has a CLI/config path.
- **No duplicate majors** in the core tree — clean deduplication throughout.
- 🟡 **`@vitest/coverage-v8` is installed but unwired.** There is no `coverage` block in `vitest.config.ts` and no coverage script, so it only activates if someone runs `vitest --coverage` by hand. Either wire it up (add a `coverage` config + a `test:coverage` script) or drop the dep.

---

## 6. Configuration audit

### `tsconfig.json` — strict baseline, room to tighten (🟠, report-only)
`strict: true` and `isolatedModules: true` are set (good), and the Next plugin + `moduleResolution: "bundler"` follow the Next 16 template. Flags **not** enabled by `strict` that would close real gaps (adopt **incrementally** — each surfaces existing errors, so this is not a low-risk one-shot): `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`. (`exactOptionalPropertyTypes` and `verbatimModuleSyntax` are stricter still and more invasive — optional.)

**Accuracy notes:** `forceConsistentCasingInFileNames` is **default-`true` in TypeScript 5+**, so its absence is *not* a gap (important on case-sensitive Linux/Render). `target: ES2017` is conservative but fine — Next transpiles per its own browserslist regardless.

### `eslint.config.mjs` — modern, one strictness lever unused (🟡)
Clean ESLint 9 flat config extending `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` + the Storybook plugin, with correct `globalIgnores`. **No footguns** — `next.config.ts` does not set `eslint.ignoreDuringBuilds` or `typescript.ignoreBuildErrors`, so lint/type errors aren't silently swallowed. Gap: **no type-aware linting** (`languageOptions.parserOptions.projectService: true`). Enabling it unlocks rules like `@typescript-eslint/no-floating-promises` (valuable in async API handlers) but will surface new findings — adopt deliberately.

### `next.config.ts` — minimal and correct (✓)
Only `images: { unoptimized: true }`, which is **deliberate** (the sharp optimizer OOMs on the 512 MB Render host) **and** security-relevant (§1: neutralizes the image-opt DoS advisory). No deprecated Next 16 options. Leave as is.

### `prisma.config.ts` — correct Prisma 7 setup (✓, one minor cleanup)
Proper v7 `defineConfig` (`schema`, `migrations.path`/`seed`, `datasource.url: env("DATABASE_URL")`) with the `prisma/load-env` shim that compensates for v7 no longer auto-loading `.env` (commit #168).

> **Adapter wiring is correct — a common misreading to head off:** in Prisma 7 the SQLite driver adapter belongs on the **client**, not in `prisma.config.ts`. It's wired exactly right at `src/lib/prisma.ts:14` — `new PrismaBetterSqlite3({ url })` → `new PrismaClient({ adapter })` (and identically in every `prisma/*.ts` seed/backfill script). Nothing is missing here.

🟡 **Minor real issue:** `package.json` still carries a top-level `"prisma": { "seed": "tsx prisma/seed.ts" }` key (lines 72-74) that duplicates `prisma.config.ts`'s `migrations.seed`. With a config file present, Prisma 7 reads the config and **ignores** the `package.json` key — so it's dead config that can drift. Remove the `package.json` block; `npm run seed` (`prisma db seed`) keeps working from `prisma.config.ts`.

### `vitest.config.ts` — gate is well-scoped (✓)
Two projects: **`api`** (node env, `src/app/api/test/**/*.test.ts`) — the project `npm run verify` runs — and **`storybook`** (Playwright/Chromium browser mode, run separately). Aliases mirror `tsconfig` `@/*`, and `server-only` is stubbed for the node tests. Sound. (Coverage not configured — see §5.)

### Tailwind v4 — clean (✓)
`@tailwindcss/postcss` in `postcss.config.mjs`, `@import "tailwindcss"` + `@theme` in `src/app/globals.css`, **no legacy `tailwind.config.js`**. Idiomatic v4; nothing to change.

---

## 7. Prioritized recommendations

Severity tags mirror the lens above. Nothing here was applied — each is a deliberate follow-up.

1. 🟠 **Bump `next` + `eslint-config-next` 16.2.2 → 16.2.7** (lockstep). Clears the only prod-reachable advisories (middleware bypass, RSC DoS class). Run `npm run verify` **and** `npm run build` before merge; remember merge = deploy.
2. 🟡 **`npm update vitest @vitest/browser-playwright @vitest/coverage-v8`** → 4.1.8 (clears all 4 "criticals" + `ws`), and **`npm update postcss brace-expansion`** (clears the transitive moderates). All in-range; no `package.json` edits; verify after.
3. 🟠 **Record the Node pin in-repo:** add `.nvmrc` = `22.17.1` + permissive `engines: { node: ">=22.17.1" }`, and widen `@types/node` to `^22` to match the host.
4. 🟡 **Remove the redundant `package.json` `"prisma": { seed }` key** (Prisma 7 uses `prisma.config.ts`). **Wire or drop `@vitest/coverage-v8`.**
5. 🟡 **Tighten types/lint incrementally:** adopt `noUncheckedIndexedAccess` → `noUnusedLocals`/`noUnusedParameters` → the rest, one flag per PR; consider enabling type-aware ESLint (`projectService`).
6. 🟢 **Optional minor bumps** when convenient: Prisma 7.8.0 (may retire the §1 dev-chain noise), `@tiptap` 3.25.0, storybook 10.4.2, and the patch set (`jose`, `better-sqlite3`, `vite`, `tsx`, `playwright`, `tailwindcss`). **Hold** the majors: `eslint` 10, `typescript` 6, `@types/node` 25.
7. ⚪ **Do nothing** for the Prisma dev-CLI vulns (`fast-uri`/`hono`/`@prisma/dev`) and **never `npm audit fix --force`** (it tries to downgrade `prisma` to v6).

---

## 8. Strengths (keep doing this)

- **Zero unused deps, clean deduplication, sound pinning** — a tidy dependency tree.
- **Healthy lockfile with a pinned registry** (`.npmrc`) — reproducible installs on Render and in cloud sessions.
- **Correct, idiomatic configs:** Prisma 7 adapter wired at the client, flat ESLint 9, Tailwind v4 with no legacy config, no `ignoreBuildErrors`/`ignoreDuringBuilds` escape hatches.
- **A constraint turned into a mitigation:** `images.unoptimized` both fits the 512 MB host and removes a Next advisory from the prod surface.

---

*Method: `npm audit [--json]`, `npm outdated`, `npm ls <pkg>` (transitive-path tracing), and direct reads of `package.json`, `package-lock.json`, `.npmrc`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `prisma.config.ts`, `src/lib/prisma.ts`, `vitest.config.ts`, `postcss.config.mjs`. Versions/advisory IDs current as of 2026-06-04. For code/architecture risk see [`architecture-audit.md`](./architecture-audit.md); for the no-CI rationale see its §10.*
