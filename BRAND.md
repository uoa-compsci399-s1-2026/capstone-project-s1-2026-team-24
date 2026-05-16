# HNU Website — Brand & Design Tokens

This file describes the colours, type, and component patterns actually used in our Figma design and front-end. It supersedes the prior UoA-corporate version of this file, which described an unimplemented palette.

The reference Figma file is `HNU--Copy-latest-` (file key `yDwFoBGnSMPeINI87nouvI`). Tokens below are derived from the Research, Contact, Home, and Search frames.

---

## 1. Colour palette

### Primary

| Token | HEX | Where it's used |
|---|---|---|
| `--hnu-navy` | `#0c0c48` | Top utility bar text (DONATIONS / CONTACT / EN), breadcrumbs, study-card titles, search-overlay background, button text on light backgrounds. |
| `--hnu-blue` | `#0a4479` | The workhorse colour. All body copy and headings on white, section headings, form labels, input/select borders when active, button fill (e.g. "Send Message"), category-pill borders and text, partner-section heading, icon fills. |

`#0c0c48` is the UoA Waitematā navy and is reserved for the "framing" layer — utility bar, dark overlays, monogram contexts. **For new component work on light surfaces, default to `#0a4479`.** That is the colour the design uses everywhere there is text on white.

### Hero gradient

The hero is a full-bleed dark-navy gradient overlaid with a low-opacity Māori carving pattern (rotated ≈ -12.4°). The gradient stops are:

```
linear-gradient(
  90deg,
  rgb(9, 67, 120)        49.78%,   /* near #094378 — close to --hnu-blue */
  rgba(8, 81, 132, 0.85) 54.68%,
  rgba(7, 105, 153, 0.60) 60.17%,
  rgba(3, 162, 203, 0.00) 71.99%
);
```

This is a left-anchored navy fading to translucent light-blue/cyan. The existing CSS approximation `linear-gradient(112deg, #092d65, #06699b, #02a8d0)` is acceptable — keep using it.

Hero text on this gradient is white at 75% opacity (`rgba(255,255,255,0.75)`), **not** pure white. Preserve that.

### Supporting

| Token | HEX | Where it's used |
|---|---|---|
| `--hnu-white` | `#ffffff` | Content card backgrounds, body text on dark, primary surfaces. |
| `--hnu-white-75` | `rgba(255,255,255,0.75)` | Hero headlines and sub-headings, "JOIN A STUDY" button fill, "More Information" button fill, search input fill. |
| `--hnu-input-border` | `#cac7c7` | Form input borders, select chevrons, placeholder text on white. |
| `--hnu-soft-grey` | `rgba(238,238,238,0.93)` | Featured-publication band background. Sits between full-white and full-grey. |

### CSS variables

```css
:root {
  --hnu-navy:         #0c0c48;
  --hnu-blue:         #0a4479;
  --hnu-white:        #ffffff;
  --hnu-white-75:     rgba(255, 255, 255, 0.75);
  --hnu-input-border: #cac7c7;
  --hnu-soft-grey:    rgba(238, 238, 238, 0.93);

  --hnu-hero-gradient: linear-gradient(112deg, #092d65, #06699b, #02a8d0);
  --hnu-card-shadow:   0 0 30px rgba(0, 0, 0, 0.25);
}
```

### What's gone from the old BRAND.md

The old file listed Azure `#1f2bd4` and Māhina `#00caef` as secondaries from the UoA corporate guide. **Neither appears in the Figma design.** The actual secondary in our design is `#0a4479`. The hero gradient terminates near `#02a8d0` which is close to Māhina, but it's a gradient stop, not a discrete token.

---

## 2. Typography

All type is **Inter**, loaded from `public/fonts/`.

| Role | Weight | Size | Notes |
|---|---|---|---|
| Hero H1 | Extra Bold (800) | 76px (desktop) | White 75% on the navy hero. Letter-spacing `0.02em`. |
| Section H2 (white-on-navy) | Bold (700) | 48–52px | E.g. "About Us", "OUR PARTNERS". |
| Section H2 (navy-on-white) | Bold (700) | 40–48px | Featured publication title, "Check out these studies". |
| Card title | Bold (700) | 32px | Study card titles, hero card "JOIN A STUDY". |
| Body large | Regular (400) | 30–32px | Lede paragraphs, hero sub-head. |
| Body | Regular (400) | 20px | Standard prose, nav links, breadcrumbs. |
| Form label | Bold (700) | 24px | E.g. "Name", "Email / Phone". |
| Form input / placeholder | Regular (400) | 20px | Placeholder uses `--hnu-input-border` colour. |
| Top utility bar | Bold (700) | 14px | UPPERCASE, letter-spacing `0.02em`. DONATIONS / CONTACT / EN. |
| Footer body | Regular (400) | 16px | Right-aligned legal links. |
| Footer heading | Bold (700) | 20px | "Explore", "Connect with us". |
| Category pill | Bold (700) | 24px | Inside `--hnu-blue` outlined pills. |

**Letter-spacing**: every text run in Figma carries a 0.02em tracking (e.g. `tracking-[0.4px]` on 20px text). Reflect this in global type styles.

**Alignment**: hero text is left-aligned. Section headings inside cards are often centred. Form labels left-aligned. Footer legal line right-aligned.

---

## 3. Shape and elevation

### Radius scale

| Use | Radius |
|---|---|
| Content cards (hero card, contact card, study cards) | **30px** |
| Form inputs, textareas, submit buttons | **30px** |
| Inline images inside cards | 10px |
| "More Information" button | 10px |
| Category pills (e.g. "Overweight and obesity") | fully rounded (`rounded-full` / `66.5px`) |
| Navbar search pill | 28.5px |
| Hero CTA "JOIN A STUDY" | 50px |
| Search-overlay close button | 50px (circular) |

### Shadow

Cards use one elevation:

```css
box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
```

It is a soft, all-around glow rather than a directional drop shadow. Use it on all elevated white surfaces.

### Stroke

- Form inputs: **2px solid `--hnu-input-border`**.
- Category pills and hero CTA outlines: **3px solid** (navy on white pills, white-75% on hero CTAs).
- Hero CTA "JOIN A STUDY": 5px solid white-75% on transparent.

---

## 4. Components

### Buttons

Two primary patterns:

1. **Filled (`--hnu-blue`):** submit-style buttons. Navy fill, white bold 20px text, 30px radius, ~66px tall. Used for "Send Message" on the contact form.
2. **Outlined ghost (white-75% on navy hero):** transparent fill, white-75% 5px border, white-75% 32px Bold ExtraCondensed letterforms, 50px radius. Used for "JOIN A STUDY" hero CTA.

A tertiary pattern appears on the publications band:

3. **Soft chip:** white-75% fill, navy 24px text, 10px radius — "More Information". Used when the button sits over a busy photo and needs to feel quieter.

### Form inputs

- 60px tall, 30px radius, 2px solid `--hnu-input-border`, white fill.
- Placeholder colour matches the border (`#cac7c7`), 20px regular.
- Label above: 24px Bold `--hnu-blue`, ~14px gap to input.
- Select uses a 20×15 navy chevron at the right.
- Textareas use the same border and radius, taller (≈ 197px in the Figma).

### Category pills (filters / tags)

White fill, 3px solid `--hnu-blue`, fully rounded, `--hnu-blue` 24px Bold text, centred. Used on the Research page for the focus-area filter and intended for the Studies page status badges.

### Cards

- Background: `--hnu-white`.
- Radius: 30px.
- Shadow: `--hnu-card-shadow`.
- Inner images: 10px radius, inset from the card edge.
- Card titles: `--hnu-navy` (`#0c0c48`) 32px Bold.

### Navbar

- Total height 262px (desktop), composed of:
  - Top utility band (40px): white background, navy carving art, right-aligned UPPERCASE links DONATIONS / CONTACT / EN. **Note:** the Donations link will be removed as part of Track E per the latest client direction; keep the slot, just don't render the link.
  - Main band (222px): navy carving image background, UoA reversed logo top-left, HNU monogram next to it separated by a 63px vertical hairline, primary nav links centre-right (`About ▾`, `Studies ▾`, `Collaborations`), Search pill far right (28.5px radius, 3px white border, transparent fill, white "Search" 20px Medium label, search icon).

### Search overlay

- Full-bleed `--hnu-navy` (`#0c0c48`) over the hero.
- Big "Search" placeholder centred, 48px Bold, white-75%, with a 1px white hairline beneath spanning 741px.
- "Popular searches" caption 16px Regular, then 20px Bold list (Studies, Donations, Contact).
- Close affordance top-right: 57×57 circle, 3px white border, white "+" rotated 45° as an X.

### Hero

- Full-bleed image (the carving artwork rotated ≈ -12.4°) over the navy gradient.
- Headline left-aligned, 76px ExtraBold, white-75%.
- Sub-headline 32px Regular white-75%, 1–2 lines, sits ~60px below the H1.
- Breadcrumb below the hero on a white strip: "About > **Our Research**", 20px Regular, `--hnu-navy`, bold on the current page.

### Footer

- Full-bleed black background.
- Bottom band: navy carving art at 111px tall.
- Logos top-left (UoA reversed + HNU monogram, separated by 63px vertical hairline).
- Three column layout: Explore links (centre), Connect with us heading + social icons (right), and the legal line bottom-right ("The University of Auckland | Accessibility | Copyright by UniServices | Privacy | Disclaimer", 16px Regular white).

---

## 5. Imagery and graphic system

- **Hero background art** is the UoA Tāmaki Makaurau carving pattern (Whakarare / Unaunahi / Haehae). The Figma uses an official asset rotated -12.38° and overlaid with a navy gradient. Use the supplied PNG; **do not recreate the linework**.
- The same carving art is used at the bottom of the footer, full-width and un-rotated.
- The food / dish photographic asset on the home hero is a cut-out PNG and floats over the gradient at the left.

---

## 6. Logos

Files: `public/images/logos/`.

| File | Use when |
|---|---|
| `UoA-Logo-Primary-RGB-Small.png` | Light backgrounds (not currently used in any frame). |
| `UoA-Logo-Primary-RGB-Reversed-Small.png` | Dark backgrounds — navbar top-left. |
| `UoA-Logo-Primary-RGB-Reversed-Large.png` | Hero accents (home page lower-right). |

A separate HNU monogram (`1000002945`-named asset) sits beside the UoA logo in the navbar and footer, separated by a 63px vertical hairline.

### Rules

- Don't recolour or warp.
- Always reversed (white) on the navy framing.
- Maintain the 63px hairline gap when pairing UoA + HNU logos.
- Minimum width 120px on screen.

---

## 7. Accessibility

- `--hnu-navy` and `--hnu-blue` both pass AA against white for body text.
- White-75% over the hero gradient is decorative; ensure any actionable text on the hero (CTAs) reaches AA contrast — pure white may be required for small text.
- Use a contrast checker before introducing new colour pairings, particularly any tertiary white-on-grey or navy-on-grey usage.

---

## 8. Notes for future work

- **Status badges (study cards)** aren't in the Figma yet. Use the category-pill pattern (`--hnu-blue` outlined pill) as the visual basis, with the three states differentiated by colour: Recruiting = filled green, Active = outlined navy, Completed = outlined grey. Confirm with the team before locking in.
- **Admin/CMS surfaces** should consume `--hnu-navy` and `--hnu-blue` rather than generic Tailwind palette colours. The current admin shell uses `bg-blue-*` / `bg-green-*` / `bg-purple-*` and emoji icons; that wants to be replaced with brand tokens during the next CMS pass.
- **The Donation entry in the top utility bar and the Donations item in the Search overlay's Popular Searches** are present in the Figma but are being removed per the latest client direction (donations are handled through the contact form).