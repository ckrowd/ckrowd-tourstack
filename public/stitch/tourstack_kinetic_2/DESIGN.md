# Design System Specification: The Global Stage

## 1. Overview & Creative North Star: "The Kinetic Curator"
This design system moves away from the rigid, boxed-in layouts of traditional SaaS and toward a high-end editorial experience. Our North Star is **The Kinetic Curator**—a philosophy that treats every screen as a premium gallery space. 

We achieve a "Global Stage" aesthetic by rejecting standard UI crutches like heavy borders and generic grids. Instead, we use **intentional asymmetry**, **exaggerated white space**, and **tonal layering** to guide the eye. The shift to the energetic `#FF5A30` primary color isn't just a brand update; it’s a high-visibility spotlight that punctuates a sophisticated, muted backdrop.

## 2. Color & Surface Architecture
The palette is built on a foundation of warm neutrals (`#fff8f6`) to ensure the energetic orange feels like a premium accent rather than an overwhelming flood.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** 
Boundaries must be defined solely through background color shifts. To separate a hero from a content area, transition from `surface` to `surface-container-low`. For a sidebar, use `surface-container-lowest`. This creates a seamless, "molded" look that feels architectural rather than "built with a template."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to define depth:
- **Base Layer:** `surface` (#fff8f6) – The canvas.
- **Secondary Section:** `surface-container-low` (#fff1ed) – Sub-navigation or subtle groupings.
- **Interactive Cards:** `surface-container` (#ffe9e4) – The primary container for content.
- **Prominent Elevates:** `surface-container-highest` (#f9dcd5) – High-priority callouts.

### The Glass & Gradient Rule
To move beyond a "flat" digital look, use **Glassmorphism** for floating elements (e.g., navigation bars or mobile overlays). 
*   **Backdrop Blur:** 20px - 40px.
*   **Fill:** `surface` at 70% opacity.
*   **Signature Texture:** For primary CTAs and Hero accents, use a subtle linear gradient: `primary` (#b42900) to `primary-container` (#ff5a30) at a 135° angle. This adds "soul" and organic depth.

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "Global Stage" authority.

*   **Display (lg/md/sm):** Used for "Big Moments." Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to create a bold, editorial impact.
*   **Headline (lg/md/sm):** Reserved for section starts. High contrast against body text is required.
*   **Title (lg/md/sm):** Used for card headings and navigational elements.
*   **Body (lg/md/sm):** Optimized for readability. Use `body-lg` for introductory paragraphs to maintain the premium feel.
*   **Label (md/sm):** Used for metadata and overlines. Always in uppercase with +0.05em letter-spacing when used as an overline.

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through the **Layering Principle** rather than structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift. 
*   **Ambient Shadows:** If an element must "float" (e.g., a modal), use a shadow with a blur of 32px and 4% opacity, using `on-surface` (#271814) as the base color. This mimics natural light.
*   **The Ghost Border Fallback:** If accessibility requires a border, use `outline-variant` (#e4beb5) at **15% opacity**. 100% opaque borders are forbidden.

## 5. Component Logic

### Buttons & Chips
*   **Primary Button:** Uses the Signature Gradient (`primary` to `primary-container`). 8px (`DEFAULT`) rounding. Typography: `title-sm` (bold).
*   **Secondary Button:** `surface-container-high` background with `on-primary-fixed-variant` text. No border.
*   **Chips:** Use `secondary-container` (#ff8f73) with `on-secondary-container` text. These should feel like soft "pills" on the page.

### Cards & Lists
*   **The "No Divider" Rule:** Forbid the use of divider lines. Separate list items using `spacing-4` (1.4rem) or by alternating subtle background tints between `surface-container-low` and `surface-container-lowest`.
*   **Card Styling:** 8px rounding (`DEFAULT`). Use a `surface-container` background. Content should have generous internal padding (referencing `spacing-6` or `spacing-8`).

### Input Fields
*   **State Styling:** Use `surface-container-lowest` for the field fill. 
*   **Focus State:** Instead of a heavy border, use a 2px outer glow of `primary` (#b42900) at 20% opacity.

### Navigation (The Stage Rail)
*   Avoid standard top-nav bars. Use an asymmetrical "Stage Rail"—a vertical or floating horizontal element with a heavy backdrop blur and `primary` (#b42900) indicators for active states.

## 6. Do’s and Don’ts

### Do
*   **DO** use white space as a structural element. If a layout feels crowded, increase spacing to `spacing-12` or `16`.
*   **DO** use `primary` (#b42900) for "Moment of Truth" actions (Purchase, Confirm, Submit).
*   **DO** mix typography scales. A `label-md` overline above a `display-md` headline creates an instant editorial feel.

### Don’t
*   **DON'T** use black (#000000) for text. Always use `on-surface` (#271814) to maintain the warm, premium tonal balance.
*   **DON'T** use the `primary` orange for large background fills. It is an "energetic accent"—use it for highlights, buttons, and status indicators.
*   **DON'T** use 90-degree corners. Everything must adhere to the 8px (`DEFAULT`) rounding or `full` for pills to maintain the "Kinetic" fluidity.