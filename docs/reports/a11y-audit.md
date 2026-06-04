# Accessibility Audit — WCAG 2.1 AA (static analysis)

**Date:** 2026-06-04
**Scope:** Public bilingual site (EN/中文) + `/admin` console with drag-and-drop page editor
**Stack:** Next.js 16 (App Router), React 19, Tailwind v4
**Method:** Static source analysis only — no browser, no axe run, no screen-reader pass. Contrast ratios were computed from source hex values using the WCAG relative-luminance formula. Findings should be confirmed with a live AT pass before launch.
**Gate:** There is no CI; `npm run verify` (`tsc --noEmit && eslint && vitest run --project api`, `package.json:11`) is the merge gate. Merging to `main` deploys production.

---

## 1. Executive summary

The codebase has a **stronger-than-typical accessibility baseline**: the drag-and-drop editor is keyboard-operable, `<html lang>` is handled correctly across the language switch, the desktop nav and language menus use proper ARIA, and most forms are labelled. The gaps are concentrated and fixable.

**Overall posture**

| Area | Verdict |
|---|---|
| `<html lang>` for 中文 | ✅ Correct (server-seeded + client-synced) |
| Brand colour palette (navy/blue/azure) | ✅ Passes contrast |
| Drag-and-drop page editor keyboard support | ✅ Implemented (dnd-kit `KeyboardSensor`) |
| Desktop nav / language menus ARIA | ✅ Correct |
| **Block image alt text** | ❌ Defaults to empty; media-library alt never reaches the page |
| **Mobile navigation drawer** | ❌ Declares a modal it doesn't implement (no focus trap / Escape) |
| **Contrast of greys, placeholders, error red** | ❌ Multiple failures on form UI |
| **Contact / Join form error semantics** | ❌ Colour-only, not programmatically associated |
| Skip link | ❌ Missing (the `<main>` target already exists) |
| Heading hierarchy | ⚠️ Not enforced; homepage has no `<h1>` |
| Admin media picker modal | ⚠️ Not a real dialog |
| Reduced-motion support | ⚠️ Absent (marquee, autoplay, transitions) |

**The four things to fix first** (full detail below): block image alt text (**A11Y-01**), the mobile nav drawer (**A11Y-02**), form-UI contrast (**A11Y-03**), and contact/Join form error semantics (**A11Y-04**).

---

## 2. Methodology & limitations

- **Static only.** Line references point at source as of this branch. Dynamic behaviour (focus order at runtime, AT announcements) is inferred from code, not observed.
- **Contrast** was computed from the literal hex values in `globals.css` and component class strings, against the actual background each colour is used on (white `#ffffff` for the public site). Tailwind v4's default `red-500` (`oklch(0.637 0.237 25.331)` ≈ `#fb2c36`) was used for the error-text rows. See the appendix for the full table.
- **DB-driven content.** Public pages are composed from admin-authored blocks (`render-page.tsx`), so some issues (heading order, alt text) depend on authored data, not just code. Those are flagged as *structural risks* the system permits rather than guaranteed failures on every page.
- **Not covered:** PDF/exported documents, third-party embeds beyond the YouTube iframe, and anything requiring a running browser (reflow at 400% zoom, actual focus-visible rendering, motion timing).

---

## 3. Impact-ranked findings

Severity reflects **user impact** — how many users, on which core tasks, and how hard the barrier is.

| ID | Finding | WCAG SC (level) | Severity | Key location |
|----|---------|-----------------|----------|--------------|
| A11Y-01 | Block images default to `alt=""`; media-library alt text never propagates | 1.1.1 (A) | 🔴 Critical | `BlockRenderer.tsx:76,88,257` |
| A11Y-02 | Mobile nav drawer claims `aria-modal` but has no focus trap / Escape | 2.1.2, 2.4.3, 4.1.2 (A/AA) | 🔴 Critical | `Navbar.tsx:737,758` |
| A11Y-03 | Form-UI contrast failures (borders, placeholders, error red, helper) | 1.4.3, 1.4.11 (AA) | 🔴 Critical | `globals.css`, `ContactEmailForm.tsx:22` |
| A11Y-04 | Contact/Join form errors colour-only + not programmatically linked | 3.3.1, 1.4.1, 4.1.3 (A/AA) | 🔴 Critical | `ContactEmailForm.tsx:238` |
| A11Y-05 | No skip link (the `<main id="main-content">` target already exists) | 2.4.1 (A) | 🟠 Major | `render-page.tsx:74` |
| A11Y-06 | Heading hierarchy not enforced; homepage has no `<h1>` | 1.3.1, 2.4.6 (A/AA) | 🟠 Major | `HomepageHero.tsx:61` |
| A11Y-07 | Admin media picker is a `<div>` overlay, not a dialog | 1.3.1, 2.1.2, 2.4.3 (A) | 🟠 Major | `MediaPicker.tsx:94` |
| A11Y-08 | `focus:outline-none` with no visible replacement on several controls | 2.4.7 (AA) | 🟠 Major | `AdminForm.tsx:111` |
| A11Y-09 | Carousels: no carousel semantics, off-screen slides exposed, invisible focus | 1.1.1, 2.1.1, 4.1.2 (A) | 🟠 Major | `AcademicCollaborators.tsx:66`, `Updates.tsx:82` |
| A11Y-10 | No `prefers-reduced-motion` support (marquee, autoplay, transitions) | 2.3.3 (AAA), 2.2.2 (A) | 🟡 Minor | `globals.css:100`, `Updates.tsx:31` |
| A11Y-11 | DiscoverVideo autoplays; its controls are `hidden` | 2.2.2 (A) | 🟡 Minor | `DiscoverVideo.tsx:128` |
| A11Y-12 | `<html lang="zh">` could be `zh-Hans` (content is Simplified) | 3.1.1 (A) | 🟡 Minor | `app/layout.tsx:38` |
| A11Y-13 | Mobile language toggle has no `aria-pressed`/`aria-current` | 4.1.2 (A) | 🟡 Minor | `Navbar.tsx:847` |
| A11Y-14 | External links open new tab with no warning; placeholder-as-label in block editors | 3.2.5, 1.3.1 | 🟡 Minor | `PublicationIndex.tsx`, `fields.tsx:253` |

---

## 4. Detailed findings

### A. Images & alt text

#### A11Y-01 — Block images default to empty alt; media-library alt text is never used 🔴

Public content images are driven by blocks. Each block carries its **own** free-text `imageAlt` field, coerced by `str()` which **defaults to `""`**:

- `src/components/blocks/BlockRenderer.tsx:76` — `imageAlt: str(o.imageAlt)` (study cards)
- `src/components/blocks/BlockRenderer.tsx:88` — `imageAlt: str(c.imageAlt)` (info cards)
- `src/components/blocks/BlockRenderer.tsx:257` — `imageAlt: str(c.imageAlt) || undefined` (collaborations)

The media library *does* store alt text (`MediaAsset.altText`), but it is **never carried to the rendered page**. `resolveBlockContents` (`render-page.tsx:57`) only swaps `media:{id}` refs for file paths — the asset's `altText` is dropped. When an admin inserts an image via the picker, only the ID is stored:

```ts
// src/components/admin/media/MediaPicker.tsx:143-146
onClick={() => {
  onSelect(toMediaRef(asset.id));   // ← stores the media ref only, not altText
  setOpen(false);
}}
```

So there are **two disconnected alt systems**, and the one that reaches the page defaults to empty. Compounding it:

- Upload defaults to empty: `src/app/api/admin/media/route.ts:68` — `altText: typeof altText === "string" ? altText : ""`
- Schema default is empty: `prisma/schema.prisma:314` — `altText String @default("")`
- The block alt input is a **placeholder, not a label**, and is not required: `src/components/admin/page-editor/fields.tsx:251-256` (`placeholder="Image alt text"`)

**Impact:** Screen-reader users get silent or filename-less images across every content page — the single highest-impact issue. **WCAG 1.1.1 Non-text Content (A).**

**Fix (illustrative):**
```ts
// media-resolve: when resolving media:{id}, also surface the asset's altText
// as the fallback alt, so a well-described asset is described everywhere.
imageAlt: blockAlt || asset.altText || ""   // prefer per-block override, fall back to library
```
Plus: give the alt input a real `<label>` (see A11Y-14), and block publish (or warn) when a content image has empty alt in both the block and the asset. Decorative previews that intentionally use `alt=""` are correct and should be left as-is (`fields.tsx:50,144`).

---

### B. Colour contrast

#### A11Y-03 — Form-UI contrast failures 🔴

The **brand palette passes** — the failures are in greys, placeholders, and error red, all on form UI. Computed against white `#ffffff`:

| Foreground | Where used | Ratio | Min | Verdict |
|---|---|---|---|---|
| `#0c0c48` navy (`globals.css:37`) | Headings; white text on navy buttons | **18:1** | 4.5 | ✅ |
| `#0a4479` blue (`ContactEmailForm.tsx:22`) | Body/labels; white text on blue buttons | **9.9:1** | 4.5 | ✅ |
| `#1f2bd4` azure (`globals.css:41`) | Accents | **8.9:1** | 4.5 | ✅ |
| `#00caef` mahina (`globals.css:42`) | Accent — *fails if used as text/icon* | **2.0:1** | 4.5 / 3.0 | ❌ |
| `#cac7c7` (`ContactEmailForm.tsx:22,28`) | **Input borders** + placeholder text | **1.7:1** | 3.0 (1.4.11) | ❌ |
| `#8e8d8d` (`AdminForm.tsx:111`) | Admin placeholder text | **3.3:1** | 4.5 | ❌ |
| `red-500` (`ContactEmailForm.tsx:239`) | Form **error text** (`text-sm`) | **~3.8:1** | 4.5 | ❌ |
| `#0a4479`/70 (`AdminForm.tsx:182`) | Helper text (`text-xs`) | **4.4:1** | 4.5 | ❌ (marginal) |

**Impact:** Low-vision users can't reliably see input boundaries (`#cac7c7` borders at 1.7:1 fail the 3:1 **1.4.11 Non-text Contrast** bar for control boundaries), can't read placeholders, and — most seriously — may miss the red error text that fails **1.4.3 Contrast (Minimum)**.

**Fix:** Darken input borders to a ~`#767676`-equivalent (≥3:1 on white), or pair the light border with a darker focus/error outline. Use `red-600` or darker for error text and prefix it with "Error:" / an icon (also resolves the colour-only issue in A11Y-04). Raise helper-text opacity (or use the solid `#0a4479`). Treat `#00caef` as decorative only; never use it for text or essential icons on white.

---

### C. Headings & landmarks

#### A11Y-05 — No skip link 🟠

`render-page.tsx:74` already wraps content in `<main id="main-content">` — the bypass target exists — but **no "Skip to content" link points at it**, and there is no `sr-only` utility anywhere in `src/` (grep: 0 matches). Keyboard and switch users must tab through the entire Navbar (logo, search, language menu, every nav item and dropdown) on every page. **WCAG 2.4.1 Bypass Blocks (A).**

**Fix:** add a focusable, visually-hidden-until-focus anchor as the first element in the body (root `layout.tsx`):
```tsx
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-white focus:px-4 focus:py-2">
  Skip to content
</a>
```
(Tailwind v4 ships `sr-only`/`not-sr-only`; no extra CSS needed.)

#### A11Y-06 — Heading hierarchy not enforced; homepage has no `<h1>` 🟠

Each section component hard-codes its heading level independent of page context, and the block renderer imposes no structure, so the authored page determines the outline. Observed:

- **Homepage has no `<h1>`.** The hero is an `<h2>` (`HomepageHero.tsx:61`); no homepage block emits an `<h1>`.
- **Sections that start at `<h3>`** (skipping a level): `DiscoverFacilities.tsx:21`, `DiscoverCapabilities.tsx:33`, `DiscoverServicesExpertise.tsx:23`, `HomepageAboutUs.tsx:36`.
- **A second `<h1>` per page** is possible: the `publicationIndex` block renders its own `<h1>` (`PublicationIndex.tsx:228`), so any page that also has a hero `<h1>` ends up with two.
- **Duplicate headings in the DOM** from responsive variants rendering both mobile and desktop copies: `HomepageHero.tsx:28 & 142` (same `aria-label`), `InfoCardLeft.tsx:64 & 126` (same `<h2>`).

**Impact:** Screen-reader users navigating by heading get a missing/duplicated/illogical outline. **WCAG 1.3.1 (A), 2.4.6 (AA).**

**Fix:** give every page exactly one `<h1>` (make the hero block render `<h1>`); convert section leads to `<h2>` and sub-items to `<h3>`; ensure responsive variants don't expose the same heading twice (e.g. `aria-hidden` on the hidden copy, or one markup tree styled responsively). Longer term, consider deriving heading levels from block position.

---

### D. Keyboard & focus

#### A11Y-02 — Mobile nav drawer is a non-conforming modal 🔴

The drawer announces itself as a modal but doesn't behave like one:

```tsx
// src/components/layout/Navbar.tsx:758-764
{mobileOpen && (
  <div role="dialog" aria-modal="true" ...>   // ← promises modal semantics
```

The focus-trap + Escape handler at `Navbar.tsx:256-284` is gated on `searchOpen` (the search dialog) — it does **not** run for `mobileOpen`. Result: with the drawer open, focus can leave it into the page behind, and **Escape does nothing**. The toggle button has an `aria-label` but **no `aria-expanded`** (`Navbar.tsx:737-739`), and the in-drawer About/Studies accordion buttons lack `aria-expanded` too (`Navbar.tsx:776,803`).

**Impact:** On mobile/narrow viewports — the primary experience for many users — keyboard and screen-reader users can't reliably operate or escape the main navigation. **WCAG 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 4.1.2 Name/Role/Value.**

**Fix:** Reuse the existing search-dialog trap. Generalise the `Navbar.tsx:256-284` effect to also fire when `mobileOpen` (trap Tab within the drawer, close on Escape, restore focus to the toggle on close). Add `aria-expanded={mobileOpen}` to the toggle and `aria-expanded` to the accordion buttons.

#### A11Y-07 — Admin media picker is not a real dialog 🟠

```tsx
// src/components/admin/media/MediaPicker.tsx:93-95
{open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="...rounded-2xl bg-white shadow-2xl">
```

No `role="dialog"`, no `aria-modal`, no focus trap, no Escape handler, and focus is not restored to the "Choose from library" trigger on close. **Impact:** admins using AT to insert images get no dialog boundary and can tab into the page behind. **WCAG 1.3.1, 2.1.2, 2.4.3.** **Fix:** add `role="dialog" aria-modal="true"` + an accessible name, trap focus, close on Escape, and restore focus on close (mirror the Navbar search pattern).

#### A11Y-08 — Focus not visible on several controls 🟠

`focus:outline-none` with no ring replacement (the only focus cue is a border-colour change, or nothing):

- `src/components/admin/AdminForm.tsx:111` — admin inputs (border-colour only)
- `src/components/admin/media/MediaLibrary.tsx:256,384,395` — media search + metadata inputs

Public inputs (`ContactEmailForm.tsx:22,28`) also rely on a border-colour change only. **WCAG 2.4.7 Focus Visible (AA).** *(The rich-text editor is fine — it removes the inner outline but the wrapper shows a `focus-within` ring, `RichTextField.tsx:126`.)* **Fix:** add a `focus-visible:ring-2 focus-visible:ring-[#0a4479]` (or similar) wherever `outline-none` is used.

---

### E. Forms & errors

#### A11Y-04 — Contact & Join forms: error semantics 🔴

Both public forms (`ContactEmailForm.tsx`, `JoinStudyForm.tsx`) are **well-labelled** (every input has a real `<label htmlFor>`), but the error/required handling fails AT users:

- `noValidate` with **no `required`/`aria-required`** on any field (`ContactEmailForm.tsx:124,129…`; `JoinStudyForm.tsx:119`). Required-ness is enforced only in JS after submit.
- Errors are **colour-only** (red text) and **not linked** to the offending field — no `aria-invalid`, no `aria-describedby`; a single global message:
  ```tsx
  // ContactEmailForm.tsx:238-242  (JoinStudyForm.tsx:218-222 is identical)
  {state === 'error' && (
    <p className="text-red-500 text-sm ml-2" role="alert">{errorMsg}</p>
  )}
  ```
  `role="alert"` is good (it will be announced), but the colour-only presentation fails **1.4.1 Use of Colour**, and nothing ties the error to a field.
- The **success** state is **not announced** — it's a plain `<p>` with no `role="status"`/`aria-live` (`ContactEmailForm.tsx:112-121`, `JoinStudyForm.tsx:108-115`). A screen-reader user submitting the form may not learn it succeeded.

**Impact:** These are the site's primary conversion paths (enquiries, study sign-up). **WCAG 3.3.1 Error Identification, 1.4.1 Use of Colour, 4.1.3 Status Messages.**

**Fix:** mark required fields with `required` + a visible indicator; set `aria-invalid` and `aria-describedby` pointing to per-field error text; prefix errors with "Error:" / an icon and use `red-600`+ (A11Y-03); wrap the success message in `role="status"`.

*(Credit: the **admin** `FormField` does this better — proper `<label htmlFor>`, a visible required `*`, and the real `required` attribute, `AdminForm.tsx:132-178`. Mirror that on the public forms.)*

---

### F. ARIA & interactive widgets

#### A11Y-09 — Carousels 🟠

**AcademicCollaborators / IndustryCollaborators** (custom scroll-snap carousel, `AcademicCollaborators.tsx:64-109`): pagination dots are correctly labelled buttons (`aria-label={`Go to card ${i+1}`}`, `:96`), but the scroller has **no `aria-roledescription="carousel"`**, off-screen cards are **not hidden** from AT (no `aria-hidden`/`inert`), and the track itself isn't keyboard-operable (only the dots are). **Updates** carousel (`Updates.tsx:82-128`): prev/next buttons are labelled but rendered `opacity:0; pointer-events:none` until hover (`:97-98,:122-123`), so a keyboard user who tabs to them gets **no visible focus** and they're unusable on touch. **WCAG 1.1.1, 2.1.1, 2.4.7, 4.1.2.**

**Fix:** add carousel semantics and an accessible label to each scroller; hide off-screen slides from AT; make prev/next visible on `:focus-visible` (not just `:hover`) and reachable on touch.

#### ARIA that is already correct ✅
- Desktop About/Studies dropdowns: `aria-expanded` + `aria-haspopup` + `aria-controls`, Escape closes, search dialog traps focus (`Navbar.tsx:467-625, 256-284`).
- Desktop language switcher: a real listbox — `aria-haspopup="listbox"`, `role="listbox"`/`role="option"`, `aria-selected` (`Navbar.tsx:392-417`).
- `InfoTooltip` (admin): `role="tooltip"`, `aria-describedby`, focus/blur + Escape (`InfoTooltip.tsx`).
- Icon-only admin buttons carry `aria-label` ("Drag to reorder", "More actions", "Remove block", "Close image details", …).

---

### G. Language toggle & `<html lang>`

#### A11Y-12 — `<html lang>` is correct (minor refinement) ✅/🟡

This is handled well. The root layout is a **server** component that seeds `lang` from a cookie, so SSR emits the right attribute:

```tsx
// src/app/layout.tsx:35-38
const lang = await getServerLang();
return (
  <html lang={lang === "ZH" ? "zh" : "en"} ...>
```

and the client keeps it in sync on toggle:

```ts
// src/contexts/LanguageContext.tsx:44
document.documentElement.lang = lang === "ZH" ? "zh" : "en";
```

**WCAG 3.1.1 Language of Page (A) passes.** The only refinement: the Chinese content is Simplified (中文, 联系我们, 捐赠), so `zh-Hans` (or `zh-CN`) is more precise than the generic `zh`.

#### A11Y-13 — Mobile language toggle state 🟡

The desktop switcher is a proper listbox (above). The **mobile** toggle (`Navbar.tsx:847-857`) renders the active language with a visual border/colour only — no `aria-pressed`/`aria-current` — so AT users can't tell which language is active. **Fix:** add `aria-pressed={lang === l}` (or `aria-current`).

---

### H. Motion

#### A11Y-10 / A11Y-11 — No reduced-motion support 🟡

Nothing in the app honours `prefers-reduced-motion`:
- `globals.css:100-106` — `.marquee-track` animates `marquee` 28s **infinite** (continuous motion >5s also implicates **2.2.2 Pause, Stop, Hide**).
- `Updates.tsx:31-38` — carousel auto-advances every 5s (pauses on hover only; **2.2.2**).
- Numerous hover/scale/slide transitions (nav, cards, video) and the nav `slideDown/slideUp` keyframes.
- `DiscoverVideo.tsx` autoplays a YouTube embed and unmutes on scroll, while its play/pause/mute controls are `hidden` (`:128`) — users can't stop it. (Muted-by-default lowers severity.)

**WCAG 2.3.3 Animation from Interactions (AAA — but cheap), 2.2.2 (A).** **Fix:** add a global guard and a pause control on the marquee/autoplay:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
}
```

---

### I. What's already done well

Worth preserving as the pattern to copy elsewhere:

- **Drag-and-drop editor is keyboard-accessible** — dnd-kit `KeyboardSensor` + `sortableKeyboardCoordinates` (`PageEditor.tsx:97-102`); drag handles are real `<button>`s with `aria-label="Drag to reorder"` (`SortableBlock.tsx:71`, `RowEditor.tsx:75`); the actions popover moves focus in and restores it on close (`PopoverMenu.tsx:144-161`). This is the hardest thing to get right and it's done.
- **Admin `FormField`** — label + visible required `*` + real `required` attribute (`AdminForm.tsx:132-178`); error banners use `role="alert"` (`AdminForm.tsx:281`, login `:62`).
- **`<main id="main-content">` landmark** on every page (`render-page.tsx:74`).
- **Honeypot** is correctly hidden from AT (`ContactEmailForm.tsx:223-236`).
- **Desktop nav + language menus** ARIA (Section F).

---

### J. Tooling recommendation

There is **no automated a11y check in the gate**. `npm run verify` runs `eslint` via `eslint-config-next`, which enables only a subset of `jsx-a11y` rules. However, **`@storybook/addon-a11y` is already installed** (`package.json:49`) and unused by the pipeline.

- Add `eslint-plugin-jsx-a11y` (recommended config) so issues like missing labels, `aria-*` misuse, and non-semantic handlers fail `verify`.
- Wire the existing `@storybook/addon-a11y` (axe-core) into the Storybook test run so component-level regressions are caught.

---

## 5. Remediation checklist

**Quick wins (small, low-risk, high value)**
- [ ] A11Y-05 — add the skip link (≈5 lines in `layout.tsx`)
- [ ] A11Y-02 — add `aria-expanded` to mobile toggle + accordions; extend the existing trap to the drawer
- [ ] A11Y-04 — `role="status"` on form success; `red-600` + "Error:" prefix; `required` + `aria-invalid`/`aria-describedby`
- [ ] A11Y-03 — darken input borders (≥3:1), error red, helper text
- [ ] A11Y-08 — add a `focus-visible` ring wherever `outline-none` is used
- [ ] A11Y-12 — `zh` → `zh-Hans`; A11Y-13 — `aria-pressed` on mobile language buttons
- [ ] A11Y-10 — global reduced-motion guard

**Larger efforts (design/architecture)**
- [ ] A11Y-01 — propagate `MediaAsset.altText` through `media-resolve`; label + (optionally) require alt; warn on empty
- [ ] A11Y-06 — enforce one `<h1>` per page and a consistent outline; de-duplicate responsive headings
- [ ] A11Y-07 — make the media picker a real dialog (role, trap, Escape, focus restore)
- [ ] A11Y-09 — carousel semantics, hide off-screen slides, focus-visible controls
- [ ] A11Y-11 — expose video controls / respect reduced-motion
- [ ] J — add `eslint-plugin-jsx-a11y` to the gate; wire `@storybook/addon-a11y`

---

## Appendix — contrast computations

Relative luminance per WCAG 2.x: linearise each sRGB channel, `L = 0.2126R + 0.7152G + 0.0722B`, ratio `= (L_light + 0.05) / (L_dark + 0.05)`. All against background white `#ffffff` (L = 1.0).

| Hex | L | Ratio vs white | Normal text (4.5) | Large/UI (3.0) |
|---|---|---|---|---|
| `#0c0c48` | 0.0081 | 18.1:1 | ✅ | ✅ |
| `#0a4479` | 0.0558 | 9.9:1 | ✅ | ✅ |
| `#1f2bd4` | 0.0677 | 8.9:1 | ✅ | ✅ |
| `#00caef` | 0.485 | 2.0:1 | ❌ | ❌ |
| `#8e8d8d` | 0.267 | 3.3:1 | ❌ | ✅ |
| `#fb2c36` (red-500) | 0.226 | 3.8:1 | ❌ | ✅ |
| `#0a4479` @70% over white | 0.189 | 4.4:1 | ❌ (marginal) | ✅ |
| `#cac7c7` | 0.575 | 1.7:1 | ❌ | ❌ |

*Ratios rounded to one decimal. "Large/UI" = the 3:1 bar for large text (1.4.3) and for component/state boundaries (1.4.11).*
