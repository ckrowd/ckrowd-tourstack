# Design System Specification: High-End Editorial Strategy

## 1. Overview & Creative North Star
This design system is built upon the North Star of **"The Global Stage."** In the world of high-stakes touring, the interface must act as both the rigid scaffolding of a world-class stage and the vibrant energy of the performance itself. We reject the "SaaS-standard" look of boxed-in grids and 1px borders. Instead, we embrace a **High-End Editorial** aesthetic—utilizing expansive white space, intentional asymmetry, and tonal layering to create a digital environment that feels premium, authoritative, and kinetic.

The goal is to bridge the gap between the precision required by corporate financiers and the raw energy of creative management. We achieve this by grounding "Electric Purple" energy within a "Sophisticated Slate" architectural framework.

---

## 2. Colors & Surface Philosophy
Color is not just decorative; it is a tool for orientation and atmospheric depth.

### The "No-Line" Rule
**Designers are strictly prohibited from using 1px solid borders to define sections.** To create a premium feel, boundaries must be defined through background color shifts. Use `surface-container-low` for secondary sections sitting atop a `surface` background. This creates a "milled" look, as if the UI is carved from a single block of material rather than assembled from separate parts.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
- **Surface (Base):** The vast floor of the application.
- **Surface-Container-Low:** For large, secondary content areas (e.g., sidebars or background groupings).
- **Surface-Container-Lowest:** For the primary "Canvas" or cards where the most important data lives.
- **Surface-Container-High:** For elevated interactive elements or headers.

### The "Glass & Gradient" Rule
To inject "soul" into the data-heavy environment, main CTAs and Hero sections should utilize a subtle linear gradient from `primary` (#4400a8) to `primary_container` (#5d21d0). Floating navigation or "Spotlight" modals must use **Glassmorphism**: a semi-transparent `surface` color with a `backdrop-filter: blur(20px)` to allow the vibrant primary tones to bleed through softly.

---

## 3. Typography
The typography is designed to mimic a high-end music journal—bold, confident, and meticulously spaced.

*   **Display & Headlines (Manrope):** Our "Voice." Large scales like `display-lg` (3.5rem) should be used for key metrics (e.g., total tour revenue) or major section headings. The Manrope typeface provides a structural, tech-forward geometric feel that commands attention.
*   **Body & Titles (Inter):** Our "Engine." Inter is used for all data-rich environments. It is neutral, highly legible, and allows the energetic headlines to take center stage without competing for visual "noise."
*   **Labeling:** Use `label-md` and `label-sm` in `on_surface_variant` (#494455) for metadata to ensure a clear hierarchy between high-level insights and granular details.

---

## 4. Elevation & Depth
We define depth through **Tonal Layering** rather than traditional structural lines or heavy shadows.

### The Layering Principle
Stacking is our primary method of containment. A `surface-container-lowest` card placed on a `surface-container-low` background creates a soft, natural "lift" that feels integrated into the environment.

### Ambient Shadows
Shadows are reserved only for "floating" objects (Modals, Popovers).
- **Shadow Spec:** Extra-diffused. `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06);`. 
- The shadow color should be a tinted version of the `on_surface` color, never a generic black or grey, to mimic natural ambient light.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in high-density data tables), it must be a **Ghost Border**: use `outline_variant` (#cbc3d7) at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden as they clutter the "Premium" visual field.

---

## 5. Components

### Buttons (The Interaction Core)
*   **Primary:** Solid `primary` (#4400a8) with `on_primary` text. Use a subtle gradient to `primary_container` for depth. Shape: `rounded-md` (0.75rem).
*   **Secondary:** `secondary_container` (#d5e3fd) background with `on_secondary_container` text. This provides a "slate" professional feel without being as aggressive as the primary.
*   **Tertiary (Action):** Use the `tertiary` (Gold/Orange) tokens for "Action" and "Success." This is the "Spotlight" color—use it sparingly for high-conversion moments or "Live" status indicators.

### Cards & Lists
*   **The Divider Ban:** Do not use line dividers between list items. Use vertical white space (`spacing-4` or `spacing-6`) and subtle background shifts on hover (`surface_container_high`). 
*   **Asymmetric Data:** In cards, experiment with offsetting the primary metric (e.g., Ticket Sales) using `display-sm` typography to create an editorial layout that feels custom-built.

### Input Fields
*   **Form Style:** Use "Filled" inputs with `surface_container_highest` (#e0e3e5) backgrounds. Avoid outlined boxes. The bottom border should be a `ghost border` that animates to `primary` thickness on focus.

### Additional Signature Components
*   **The "Spotlight" Badge:** A small, high-vibrancy chip using `tertiary_fixed` (#ffddb8) to highlight active tours or critical alerts.
*   **The Stage-View Timeline:** A custom horizontal scroll component that uses `glassmorphism` for the playhead, allowing the background data-grid to remain visible underneath.

---

## 6. Do's and Don'ts

### Do:
*   **Use Whitespace as a Component:** Allow the data to breathe. The "Global" feel comes from an expansive, uncrowded layout.
*   **Align to a Base-4 Grid:** Use the Spacing Scale (2, 4, 8, 12, 16) to maintain mathematical harmony.
*   **Leverage Tonal Transitions:** Transition from `surface` to `surface-container-low` to signal a change in content context.

### Don't:
*   **Don't use 100% Black:** Use `on_surface` (#191c1e) for text. Pure black is too harsh for a premium digital experience.
*   **Don't over-use the Accent Gold:** If everything is in the "spotlight," nothing is. Reserve `tertiary` for critical success states or primary actions.
*   **Don't use Default Shadows:** Avoid the "dirty" look of standard CSS shadows. Always use the low-opacity, high-blur ambient spec.
*   **Don't trap data in boxes:** Let the typography and color shifts do the work. If you feel the need to draw a box, try increasing the padding instead.