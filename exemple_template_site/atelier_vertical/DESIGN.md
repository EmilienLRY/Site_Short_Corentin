```markdown
# Design System Strategy: The Editorial Performance Standard

## 1. Overview & Creative North Star: "The Kinetic Curator"
This design system is built for a French creative powerhouse that balances the raw energy of short-form vertical video with the prestige of high-end strategy. We are moving away from "SaaS-generic" interfaces. Our Creative North Star is **"The Kinetic Curator."**

The experience must feel like a premium physical lookbook. We achieve this through **intentional asymmetry**, where large editorial headlines are offset against minimalist UI elements, and **tonal depth**, where we replace harsh lines with soft shifts in paper-like textures. The goal is to make the user feel like they are not just looking at data or videos, but at a curated exhibition of performance.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated triptych: a warm, breathable background; deep, authoritative charcoal; and a muted, organic sage green.

### Surface Hierarchy & Nesting
To achieve an "expensive" feel, we abandon the flat web grid. We treat the UI as layers of fine stationery.
- **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined by shifts in background color. For example, a `surface-container-low` section should sit on a `surface` background to create a natural, soft-edged division.
- **Tonal Nesting:** Use `surface-container` tiers (Lowest to Highest) to create functional depth. A video detail card (`surface-container-lowest`) should sit atop a background of `surface-container-low`, creating a "lift" through color rather than structural lines.

### Signature Textures & Glass
- **The "Organic Glass" Rule:** For floating navigation or video overlays, use semi-transparent `surface` colors with a 12px–20px backdrop-blur. This softens the tech-heavy nature of video and integrates the UI into the content.
- **Linear Polish:** While we avoid flashy gradients, a subtle linear transition from `primary` (#4D644E) to `primary_container` (#8DA68D) is permitted on high-impact CTAs to provide a "metallic silk" sheen.

---

## 3. Typography: The Editorial Voice
Typography is our primary tool for authority. We pair the timeless weight of **Noto Serif** with the functional precision of **Manrope**.

- **Display & Headline (Noto Serif):** Use `display-lg` and `display-md` with tight letter-spacing (-2%) to create a "Vogue-esque" impact. These should often be left-aligned with significant whitespace to their right.
- **Body & Labels (Manrope):** All functional text uses Manrope. Its clean, geometric nature provides a high-end, modern contrast to the serif headlines.
- **The Hierarchy Strategy:** Large `display` styles are for "The Hook," while `title-sm` and `label-md` in all-caps (tracking +5%) are for "The Data." This creates a clear distinction between creative expression and performance metrics.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "muddy." In this system, we use light and tone to imply dimension.

- **The Layering Principle:** Stacking tiers is the default. 
  - Level 0: `surface` (The "Desk")
  - Level 1: `surface-container-low` (The "Folder")
  - Level 2: `surface-container-highest` (The "Document")
- **Ambient Shadows:** When a shadow is necessary (e.g., a floating video player), it must be a "Long-Soft" shadow. Use a 32px blur, 0px spread, and 4% opacity, using the `on-surface` (#1A1C1B) color as the tint.
- **The Ghost Border:** If accessibility requires a stroke (e.g., input fields), use `outline-variant` at 20% opacity. This creates a "suggestion" of a border that doesn't break the minimalist aesthetic.

---

## 5. Components

### Buttons & Interaction
- **Primary:** Filled `primary` (#4D644E) with `on-primary` (#FFFFFF) text. Use `md` (0.375rem) roundedness for a sharp, tailored look.
- **Secondary:** Outlined with a "Ghost Border" (20% `outline-variant`).
- **Tertiary:** Pure text with `title-sm` styling and a 1px underline that expands on hover.

### Video Performance Cards
- **Forbid Dividers:** Use vertical whitespace (32px or 48px) to separate card elements.
- **Layout:** Use an asymmetrical layout—place the vertical video preview on the left and the performance metrics (`headline-sm`) on the right, utilizing the `surface-container-low` background to ground the element.

### Input Fields & Controls
- **Text Inputs:** Use a "Bottom-Line Only" approach or a very subtle `surface-container-high` fill. Avoid the "boxed-in" look.
- **Chips:** Use `full` (9999px) roundedness with a `surface-variant` background for a clean, pill-shaped filter aesthetic.

### Vertical Content Scrubber (Custom Component)
For an agency specializing in short-form video, use a custom progress bar: a thin `outline-variant` track with a `primary` indicator that glows slightly when active.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace the Void:** Use 80px+ margins between major sections. Whitespace is a luxury signal.
- **Use "Paper" Transitions:** When navigating, use soft fades and slight vertical slides (20px) to mimic flipping a page.
- **Color Logic:** Use the Sage Green (`primary`) sparingly. It is a "reward" color for successful performance metrics or primary CTAs.

### Don't:
- **No 100% Black:** Never use #000000. Always use `on-surface` (#1A1C1B) to maintain the "sober" warmth.
- **No Sharp Corners:** While we like "sharp lines," use the `sm` (0.125rem) or `md` (0.375rem) radius to prevent the UI from feeling aggressive.
- **No Heavy Shadows:** If the shadow is visible at first glance, it’s too dark. It should be felt, not seen.
- **No Standard Grids:** Avoid perfectly centered, symmetrical 3-column layouts. Try a 2/3 and 1/3 split to create visual tension.

---

*This design system is a living document. It is designed to prioritize the "Art of the Edit" and the "Science of the Click." Keep it breathable, keep it expensive.*```