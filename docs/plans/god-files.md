# God-files decomposition plan (B45, B50)

> **Status:** plan only — no code in this PR. This document is the execution
> guide for the follow-up slice PRs. It does **not** change any of the target
> files.

## Purpose & scope

Three oversized "god" files were flagged in
[`docs/reports/tech-debt-audit.md`](../reports/tech-debt-audit.md) §6.3 and
tracked as **B45** and **B50** in
[`docs/reports/MASTER-BACKLOG.md`](../reports/MASTER-BACKLOG.md). This plan
defines the module boundaries, the client/server split, and a strictly ordered
sequence of slices where **every intermediate PR leaves behaviour identical**.

| File | Current size | Item | Decompose into |
|---|---|---|---|
| `src/app/admin/publications/page.tsx` | 1042 lines (`"use client"`) | B45 | `src/components/admin/publications/*` (table, panel, leaves) |
| `src/components/layout/Navbar.tsx` | 977 lines (`"use client"`) | B45 | TopBar, DesktopNav, MobileMenu, SearchDialog + `useNavbarSearch` |
| `src/components/admin/page-editor/PageEditor.tsx` | 619 lines (`"use client"`) | B50 | `PublishBar` + `usePageEditorApi` |

`src/lib/blocks/registry.ts` (680 lines) is **explicitly out of scope** — the
audit marks it "leave as-is: it's data, and keeping it unified is correct."

## Constraints that shape every slice

- **No CI.** The only automated gate is
  `npm run verify` = `tsc --noEmit && eslint && vitest run --project api`.
  It runs the **API test project only** — it does **not** execute the
  component/Storybook suite, so it will **not** catch UI or a11y regressions in
  any of these three files. Type/lint safety is covered; behaviour is not.
- **Merging to `main` deploys production.** Never push to `main`. Each slice is
  its own small branch + PR, individually verifiable, merged on its own merits.
- **512 MB Render Starter** is the real ceiling — decomposition must not add
  runtime cost; these are structural moves, not new abstractions on the hot path.
- Stack: Next.js 16.2.7 (App Router) · React 19.2.4 · Prisma 7.7 +
  better-sqlite3 · Tailwind v4.
- **Navbar carries recent a11y work that must not regress** (B20–B23, B34–B38):
  `useFocusTrap` traps on the mobile drawer and the search dialog, full
  `aria-*`/`role` coverage, a combobox/listbox search with `aria-activedescendant`
  arrow-key navigation, focus restoration to the trigger on close, `aria-live`
  result announcements, and body-scroll lock.

## Global per-slice protocol

1. **One slice = one small branch off `main` = one PR.** Suggested branch
   naming: `b45-pub-*`, `b45-nav-*`, `b50-editor-*`.
2. **Gate every PR with, in order:**
   - `npm run verify` (mandatory — must be green before review).
   - The slice's **named manual smoke checklist** (below), run *before* the
     change to confirm the baseline and *after* to confirm parity.
   - For Navbar slices: the **keyboard + screen-reader a11y checks** (below).
   - Optional but recommended for risky slices: `vitest run --project storybook`
     (Storybook interaction + `@storybook/addon-a11y`).
3. **Pure structural moves first.** A "move" relocates code (JSX, a function, a
   constant) and wires props/imports through with **zero behaviour change**.
4. **Logic-shaping is never mixed with a move.** Lifting state into a hook is its
   own isolated PR, done *after* the surrounding moves, and is itself a faithful
   lift (same observable behaviour).
5. **Rollback = revert the single slice PR/commit.** Because slices are
   independent and each is verified on its own, reverting one never disturbs the
   others. Nothing reaches production without its own verify + smoke pass.

---

## Section A — `admin/publications/page.tsx` (B45)

**Client/server decision: stays a client tree.** The page is interactivity-first
(pagination, debounced search, filter pills, inline approve/reject/delete,
collapsible settings). B45 does **not** ask for a server split here (unlike
Navbar), and converting the client `fetch` to server-side data loading would be a
behaviour-changing data-flow refactor. So the whole decomposition is "move the
already-co-located sub-functions into sibling files under
`src/components/admin/publications/`." This is the **lowest-risk** of the three —
most of the pieces are already standalone functions in one file.

### Module boundaries

```
src/components/admin/publications/
  types.ts                 # Publication, SyncResponse, FilterSettings, Counts…
  constants.ts             # STATUS_OPTIONS, STATUS_COLOURS, ROUTE_RULES,
                           #   ROUTE_PILL_ACTIVE, statusDisplay()
  CountChip.tsx            # leaf (presentational)
  SettingLabel.tsx         # leaf
  SettingTextarea.tsx      # leaf
  RouteSelector.tsx        # leaf
  RouteRuleRow.tsx         # leaf (composes RouteSelector)
  SyncSummary.tsx          # ORCID sync summary + breakdown table
  FilterSettingsPanel.tsx  # accordion: lazy-load + save settings (keeps its
                           #   own internal state)
  PublicationsTable.tsx    # table + status pills + search input + pagination
```

`page.tsx` becomes a thin client container holding the page-level data/filter
state and composing the above.

### Extraction order (each pure move unless tagged)

- **P0 — types & constants.** Move pure type declarations to `types.ts`;
  `STATUS_OPTIONS`, `STATUS_COLOURS`, `ROUTE_RULES`, `ROUTE_PILL_ACTIVE`, and the
  pure `statusDisplay()` helper to `constants.ts`. Update imports. No JSX touched.
- **P1 — leaf presentational components.** Extract `CountChip`, `SettingLabel`,
  `SettingTextarea`, `RouteSelector`, `RouteRuleRow`, `SyncSummary` (each already a
  standalone function taking props) into their own files.
- **P2 — `FilterSettingsPanel`.** Move the accordion component **verbatim**,
  including its internal `useState`/lazy-load (`requestedRef` pattern)/save logic.
  It imports the P1 leaves.
- **P3 — `PublicationsTable`.** Lift the table section (status-filter pills,
  search input, loading/empty states, rows, pagination footer) into a prop-driven
  component. Props: `{ publications, loading, page, totalPages, total,
  statusFilter, search, onPageChange, onStatusFilter, onSearch, onApprove,
  onReject, onDelete }`. Handlers continue to live in `page.tsx`; the table just
  renders + calls them.
- **P4 — *(logic, last, isolated, optional)*** lift data/pagination/filter/debounce
  into `usePublications()` and the mutations (`quickStatus`, `deletePublication`,
  `runOrcidSync`) into `usePublicationsMutations()`. Only land this if it stays a
  faithful behaviour-identical lift; it is **not** required to close B45.

### Smoke checklist (run before & after every P-slice)

- `/admin/publications` loads; list + count chips render.
- Pagination next/prev changes page and refetches.
- Status-filter pills (All/Pending/Approved/Rejected) filter the list.
- Search box debounces (~300 ms) and filters.
- Quick approve / reject updates the row's status badge in place.
- Delete asks for confirmation, then removes the row.
- "Sync from ORCID" runs and renders the sync summary (+ breakdown toggle).
- Filter-settings panel opens, lazy-loads on first open, saves.
- Route-rule pills toggle; the 5 keyword textareas persist on save.

---

## Section B — `Navbar.tsx` (B45) — a11y is the headline risk

**Client/server decision: stays a client tree.** Every input to the navbar is
client-side — `useLanguage`, `useSiteSettings`, `useNavStudies` contexts,
`usePathname`, scroll detection, four overlapping dropdowns, the search dialog,
and the focus-trapped mobile drawer. A true "server chrome" shell would have to
push context-derived values (logo paths, translations, nav studies) down as props
from a server parent — a behaviour-changing data-flow + hydration refactor for
little gain, against an a11y-critical tree. **The server-island split is deferred**
(see N6); the in-scope work is sub-component extraction + search-logic
consolidation, all behaviour-identical client moves.

### Boundary regions

| Region | Current location | Becomes |
|---|---|---|
| Utility/top bar + language listbox | ~330–374 | `TopBar.tsx` |
| About/Studies dropdowns + nav links + search trigger | ~406–672 | `DesktopNav.tsx` |
| Focus-trapped mobile drawer + nested accordions | ~725–833 | `MobileMenu.tsx` |
| Search overlay (combobox input, grouped listbox, live regions) | ~837–974 | `SearchDialog.tsx` |
| All search state/effects/handlers | 136–203, 243–296 | `useNavbarSearch()` hook |

**Critical coupling to preserve:** the search **trigger** button lives in the
desktop nav, but the **dialog** is a sibling overlay; focus restoration on close
ties them via `searchTriggerRef`. Whatever level renders both must own the refs.
The body-scroll-lock effect (lines 205–221) depends on `searchOpen || mobileOpen`
— it spans **both** modals, so it **stays at the Navbar level** (or becomes a tiny
shared `useBodyScrollLock(locked)` hook); it does **not** go inside the search
hook. `useFocusTrap` (`src/hooks/useFocusTrap.ts`) is already shared and stays
**untouched**.

> Honesty note on "dedupe search into a hook": the audit reported the debounce
> logic "appears twice", but the current file has a **single** debounce-fetch
> effect (159–203) plus several scattered companions (close-reset 147–155,
> initial-focus/restore 136–143, the `useFocusTrap` wiring, `goToResult` 243–248,
> `handleSearchInputKeyDown` 253–272, `groupedResults` 291–296). The real win of
> `useNavbarSearch` is **consolidating those scattered pieces into one cohesive
> unit**, not deleting a literal duplicate.

### Extraction order

Ordered so the easy, obviously behaviour-identical JSX moves land first, leaving
the sensitive search-logic consolidation for last when the surface is smallest.
Through N1–N4 the search state stays in `Navbar` and is passed down as props, so
each extracted component is a "dumb" prop-driven view; N5 then swaps the prop
source from inline `useState` to the hook **without changing any consumer's prop
shape**.

- **N0 — static data → `navbar/constants.ts`.** Move truly-static arrays
  (`POPULAR_SEARCHES`, `SEARCH_GROUP_ORDER`, `ABOUT_ITEMS`, `TOP_BAR_LINKS`). Note:
  `SEARCH_GROUP_LABELS` depends on the translation object `t`, so expose it as
  `getSearchGroupLabels(t)` or leave it in the component — **do not** fake it into
  a static const.
- **N1 — `TopBar.tsx`** (incl. the language-selector `role="listbox"` /
  `aria-selected` a11y). Prop-driven. Pure move.
- **N2 — `MobileMenu.tsx`.** The drawer JSX, its accordion state
  (`mobileAboutOpen`, `mobileStudiesOpen`), and its
  `useFocusTrap(mobileOpen, drawerRef, closeMobile, mobileToggleRef)` move
  **together** with `mobileDrawerRef`. The hamburger **toggle ref stays in
  `Navbar`** and is passed in (so focus restoration still targets the toggle).
  Pure move.
- **N3 — `SearchDialog.tsx`.** The dialog JSX: combobox `<input>`, grouped
  `role="listbox"` results, `aria-live` regions. State/refs still owned by Navbar
  and passed as props. **Preserve every `aria-*` / `role` / `id` exactly** —
  `role="dialog"`/`aria-modal`, `role="combobox"`, `aria-expanded`,
  `aria-controls="search-results"`, `aria-activedescendant="search-result-${i}"`,
  `id="search-results"`, `id="search-result-${index}"`, `role="option"`,
  `aria-selected`. Pure move.
- **N4 — `DesktopNav.tsx`.** About/Studies dropdowns (with
  `aria-expanded`/`aria-haspopup`/`aria-controls`) + nav links + the search
  trigger button (`searchTriggerRef`). Dropdown open/closing state passes as props
  (or an optional `useNavDropdowns` hook); the click-outside effect and
  `headerRef` stay in `Navbar`. Pure move.
- **N5 — *(logic, isolated — the "search into a hook" deliverable)*** create
  `useNavbarSearch()` owning: `searchOpen`, `searchQuery`, `searchResults`,
  `searchLoading`, `searchPerformed`, `activeIndex`; the three refs
  (`searchInputRef`, `searchTriggerRef`, `searchDialogRef`); the debounce-fetch
  effect, close-reset effect, initial-focus/restore effect, `useFocusTrap` wiring
  for search, `goToResult`, `handleSearchInputKeyDown`, and the `groupedResults`
  derivation. Both the trigger (in `DesktopNav`) and `SearchDialog` consume the
  hook's returned bag — **same prop shapes as N3/N4**, so consumers don't change.
  Body-scroll-lock stays in `Navbar`; the hook exposes `searchOpen` for it.
  Faithful lift, no behaviour change.
- **N6 — *(deferred — documented, not scheduled)*** server-chrome / client-island.
  Recorded as a future go/no-go decision: would require lifting context-derived
  data to a server parent and risks the a11y tree for marginal benefit. If ever
  taken, it is its own isolated PR with its own full verification — not part of the
  move slices above.

### a11y smoke checklist (run before & after every N-slice)

- **Focus trap:** with the mobile drawer / search dialog open, Tab and Shift+Tab
  cycle stays inside the overlay.
- **Escape + focus restore:** Escape closes the overlay and focus returns to its
  trigger (hamburger toggle / search button).
- **Search keyboard nav:** ArrowDown/ArrowUp move the highlight and update
  `aria-activedescendant`; Enter activates the active result (routes + closes).
- **ARIA state:** `aria-expanded`/`aria-controls` toggle correctly on
  About/Studies/Language; the search `role="combobox"`
  `aria-expanded`/`aria-controls` flip with results presence.
- **Live regions:** `aria-live="polite"` announces "loading" and "no results".
- **Body scroll:** locks while either overlay is open, unlocks (to the prior
  value) on close.
- **Language listbox:** `role="option"` + `aria-selected` reflect the active lang.

> Tests-first for N2/N3/N5: author a Storybook interaction/play test capturing the
> focus-trap cycle, Escape-restores-focus, and arrow-key `aria-activedescendant`
> contract **before** the move, run via `vitest run --project storybook`. This is
> the regression net `npm run verify` cannot provide.

---

## Section C — `PageEditor.tsx` (B50)

**Audit-prescribed boundaries:** extract a `usePageEditorApi` hook and a
`PublishBar` component. The folder `src/components/admin/page-editor/` already
holds sibling components (`SortableBlock`, `BlockEditForm`, `AddBlockButton`,
`PreviewPane`, …) with no index files — match that co-located convention.

### Module boundaries

```
src/components/admin/page-editor/
  PageEditor.tsx        # container: blocks state, showPreview, DnD, layout
  PublishBar.tsx        # NEW — presentational publish toolbar + history panel
  usePageEditorApi.ts   # NEW — all fetch handlers + their state
```

- **`PublishBar`** (presentational, all-props): title/breadcrumb, draft/published
  status badge, the toolbar (history / show-hide preview / view-live link /
  discard / publish), last-published timestamp, error alert, and the version-history
  panel (rebaseline "set current as Original" + revisions list with restore). No
  fetches of its own — every action is a callback prop.
- **`usePageEditorApi(slug, publishable)`** owns the ~11 async handlers
  (`persistOrder`, `handleSave`, `handleToggleVisible`, `handleDelete`,
  `handleAdd`, `handleDuplicate`, `handlePublish`, `handleDiscard`,
  `loadRevisions`, `handleRestore`, `handleRebaseline`) and their state
  (`savingId`, `error`/`setError`, `publishing`, `revisions`, `revisionsLoading`,
  `rebaselining`, `publishedAtState`, `dirty`, and the preview-version
  `bumpPreview`).
- **Stays in `PageEditor`:** `blocks` state, `showPreview`, the dnd-kit sensors +
  `handleDragEnd`, the editor-body layout (AddBlockButton / DndContext /
  SortableBlock / PreviewPane), and `onChanged()` which delegates to
  `bumpPreview()` + `setDirty()`.

### Extraction order

- **E1 — `PublishBar` (pure JSX move first, lowest risk).** Move the toolbar +
  history panel into the new component, wiring all existing handlers/state from
  the still-monolithic `PageEditor` as props.
- **E2 — *(logic, isolated)*** extract `usePageEditorApi`. `PageEditor` and
  `PublishBar` consume it; because the hook returns the same handler signatures,
  **`PublishBar`'s props are unchanged from E1**. Faithful lift.

### Smoke checklist (run before & after E1/E2)

- Open editor for a page; add a block; edit + save a block; toggle visibility;
  duplicate; delete.
- Drag-reorder blocks — order persists (reload to confirm).
- Toggle preview pane; it reloads the iframe on a content change.
- Publish flips dirty → published and updates the last-published timestamp.
- Discard reverts the draft.
- Open history panel — revisions lazy-load; restore a revision; rebaseline
  ("set current as Original").
- A failed request surfaces the error alert.
- Existing API route tests (`src/app/api/test/**`) cover the endpoints and stay
  green — decomposition changes no endpoint.

---

## Section D — Risks, rollback, tests-first (cross-cutting)

### Risks & mitigations

| Risk | Mitigation |
|---|---|
| Navbar a11y regression (focus trap/restore, scroll lock, aria) | Faithful lifts; characterization tests authored first; manual a11y smoke per slice; keep `useFocusTrap` untouched. |
| Ref-coupling: search trigger (nav) vs dialog (overlay) breaks focus restore | Own `searchTriggerRef`/`searchDialogRef`/`searchInputRef` at the level that renders both; pass down — never duplicate. |
| Body-scroll-lock spans both modals | Keep its effect at Navbar level (or a shared `useBodyScrollLock`); never bury it in `useNavbarSearch`. |
| `npm run verify` is blind to UI/a11y (API tests only) | Per-slice manual smoke + optional `vitest run --project storybook`; treat verify as the *type/lint* gate, not the behaviour gate. |
| Interim prop-drilling looks verbose | Accepted as a transient state; the hook slice (N5/E2) tidies it. |
| Server-island change alters hydration/data flow | Deferred (N6); if taken, isolated PR with its own verification. |

### Rollback

One slice = one PR = one squashed commit. Revert that commit to restore the prior
green state; earlier slices are unaffected because each was independently verified.
Nothing merges to `main` (production) without its own verify + smoke pass.

### Tests-first

- **Riskiest slices (N2, N3, N5, E2):** write the characterization test *before*
  the move. For Navbar, Storybook interaction/play tests for the focus-trap,
  Escape-restores-focus, and arrow-key `aria-activedescendant` contracts
  (`vitest run --project storybook`). For PageEditor, lean on the existing API
  route tests for the endpoints (unchanged by the move).
- **Where an automated test isn't practical**, the slice's **named manual smoke
  checklist is the executed contract** — run it before the change to fix the
  baseline and after to prove parity.
- The publications and editor endpoints are already covered by
  `src/app/api/test/**/*.test.ts` (Vitest, `vi.hoisted` + mocked Prisma); these
  stay green throughout because no slice changes an API route.
