# University of Auckland Brand Guidelines

## Colour Palette

### Primary Colour

| Name | HEX | RGB | CMYK | Pantone |
|---|---|---|---|---|
| Waitematā – Deep Blue | `#0c0c48` | 12, 12, 72 | 100, 94, 19, 49 | 2766C |

The core UoA brand colour. Use as the primary background for navbars, headers, and key UI elements.

### Secondary Colours

| Name | HEX | RGB | CMYK | Pantone |
|---|---|---|---|---|
| Azure – Bright Blue | `#1f2bd4` | 31, 43, 212 | 100, 66, 0, 2 | 293C |
| Māhina – Light Blue | `#00caef` | 0, 202, 239 | 71, 0, 0, 0 | 306C |

Māhina means "early morning light".

### CSS Variables

```css
--uoa-waitemata: #0c0c48;  /* Primary */
--uoa-azure:     #1f2bd4;  /* Secondary */
--uoa-mahina:    #00caef;  /* Secondary */
```

### Accent Colours

Lava (Orange), Hinātore (Purple), and Whenua (Green) are available for approved/graphic designers only. No hex codes are provided in the standard guidelines — they are reserved for creative work under extended guidelines. Do not use them in standard corporate or website contexts.

---

## Typography

All type is set in **Inter**. Font files are in `public/fonts/`.

| Variant | Weight | Usage |
|---|---|---|
| Inter Display Semibold | 600 | Large headlines / titles |
| Inter Medium | 500 | Introductions / subheadings |
| Inter Bold | 700 | Sub-headers |
| Inter Regular | 400 | Body copy |
| Inter Italic | 400 italic | Titles and names of particular works |

### Size Scale

| Role | Size |
|---|---|
| Bold headers | 14pt |
| Medium sub-heads | 11pt |
| Regular body | 9pt |
| Regular footer | 6.5pt |

### Other Rules

- All text should be **left aligned**.
- For email, use **Arial** as the fallback system font.
- For anything shared externally, always export to **PDF** to prevent font compatibility issues.

---

## Logo Usage

Logo files are in `public/images/logos/`.

| File | Use when |
|---|---|
| `UoA-Logo-Primary-RGB-Small.png` | Light backgrounds |
| `UoA-Logo-Primary-RGB-Reversed-Small.png` | Dark backgrounds |
| `UoA-Logo-Primary-RGB-Large.png` | Large placements on light backgrounds |
| `UoA-Logo-Primary-RGB-Reversed-Large.png` | Large placements on dark backgrounds |

### Rules

- Use the **blue (primary) logo** on light backgrounds; use the **reversed (white) logo** on dark backgrounds.
- Minimum digital size: **120px wide**.
- Clear space: maintain a margin of at least the height of the capital "U" in "University" on all sides — nothing should appear within this zone.
- Always place the logo **top-left**, left-aligned with the page title or key message.
- A black version is available from the Brand Team only — do not create it yourself.

### Don'ts

- Do not change the colour of the logo.
- Do not place the primary (blue) logo on dark backgrounds.
- Do not place the logo over complex photography.
- Do not stretch, warp, rotate, or outline the logo.
- Do not add other colours or a keyline/rectangle box around it.
- Do not use the old composition or rearrange elements.

---

## Graphic System (Māori Visual Language)

The brand uses a distinctive set of Tāmaki Makaurau carving-inspired graphic elements: **Whakarare**, **Unaunahi**, and **Haehae** — curved and repetitive linear forms. These are reserved for approved designers only and must not be recreated independently. Do not use them unless you have the official asset files.

---

## Accessibility

Always ensure sufficient colour contrast between text and background. Use a contrast checker when placing text over the brand blues. The guidelines provide a colour guide showing which foreground/background combinations pass accessibility standards — consult this before introducing new colour pairings.
