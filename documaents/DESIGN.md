# Design System Document: The Dignity & Light Framework

## 1. Overview & Creative North Star: "The Digital Sanctuary"
The objective of this design system is to move the platform away from the "transactional" feel of typical fintech or charity portals and toward an editorial, high-end experience that honors both the donor and the recipient. 

**Creative North Star: The Digital Sanctuary**
We are creating a space of "Quiet Authority." This is achieved through an intentional use of negative space (the "Ma" in Japanese design, but applied to Arabic editorial layouts), asymmetrical content balance, and layered surfaces. We reject the rigid, "boxed-in" grid in favor of a flow that feels organic, warm, and trustworthy. We don't just present data; we tell a story of relief and community through sophisticated typography and depth.

---

## 2. Colors: Tonal Depth over Borders
The color palette is rooted in the earth (Teal) and the sun (Amber), set against a premium, parchment-like background.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established exclusively through background shifts. For example, a section using `surface-container-low` should sit directly against a `surface` background to create a "soft edge."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- **Base Layer:** `surface` (#fbf9f6)
- **Secondary Sectioning:** `surface-container-low` (#f5f3f0)
- **Interactive/Floating Containers:** `surface-container-lowest` (#ffffff)
- **Deep Nesting:** Use `surface-container-high` (#eae8e5) sparingly for inset components like search bars or data tables.

### The "Glass & Gradient" Rule
To add "soul" to the flat design, utilize the **Signature Texture**: 
- **Primary CTAs:** A subtle linear gradient from `primary` (#005440) to `primary_container` (#0f6e56) at a 135-degree angle.
- **Glassmorphism:** For floating RTL navigation bars, use `surface_container_lowest` with an 80% opacity and a `backdrop-blur` of 12px. This ensures the geometric patterns in the background "glow" through the interface.

---

## 3. Typography: Editorial Authority
The typography uses a high-contrast scale to create an "Editorial" feel. We prioritize readability in Arabic script while maintaining a modern, clean silhouette.

- **Display (beVietnamPro):** Used for "Hero" impact numbers and large-scale poetic headlines. These should be set with tight tracking to feel like a cohesive graphic element.
- **Headline (beVietnamPro):** Used for section titles. Ensure these have significant "breathing room" (at least `spacing-16` above them).
- **Body & Labels (plusJakartaSans):** Chosen for its high x-height and legibility in small sizes. 

**The Hierarchy Note:** Headlines should feel "heavy" and authoritative (Primary color), while body text remains Charcoal (`on_surface_variant`) to reduce eye strain and feel approachable.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Tonal Layering** to create a sense of three-dimensional space.

- **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card (White) on a `surface-container-low` background (Soft Grey-White). The contrast is enough to define the object without visual clutter.
- **Ambient Shadows:** For "Hero" donate cards that must float, use a shadow with a 40px blur, 0px spread, and 6% opacity of `on_primary_fixed` (#002117). This mimics the soft, diffused light of a sanctuary.
- **The Ghost Border:** If a form field requires a border for accessibility, use `outline_variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons: The Tactile Primary
- **Primary:** Rounded `0.5rem` (8px). Background: Signature Teal Gradient. Typography: `label-md` in White.
- **Secondary:** Transparent background with a `Ghost Border` (outline-variant 20%).
- **Tertiary:** No border, Teal text. Used for "Read More" or "View Details."

### Cards: The Narrative Container
- **Styling:** `1rem` (16px) corner radius. No borders.
- **Content:** Use `spacing-6` (2rem) for internal padding to ensure the Arabic text doesn't feel "choked."
- **Nesting:** Cards should sit on a background color exactly one tier darker/lighter than the card itself.

### Inputs: The Sophisticated Form
- **State:** Resting state uses `surface_container_high`. Focused state transitions to `surface_container_lowest` with a subtle `secondary` (Amber) 2px bottom-stroke only.
- **RTL Alignment:** Labels must be right-aligned with a `label-sm` weight, positioned `spacing-1.5` above the input.

### Islamic Geometric Accents
- **Usage:** Patterns must not be used as high-contrast backgrounds. They should be "ghosted" into the `surface-variant` using 3% opacity. They function as a watermark of trust, not a focal point.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place an image offset to the left while text is right-aligned to create a sophisticated, editorial "magazine" feel.
- **Embrace White Space:** Use `spacing-20` (7rem) or `spacing-24` (8.5rem) between major landing page sections.
- **Color Transitions:** Use `secondary_container` (Amber) to highlight the specific amount "Remaining to be Paid" for a debtor.

### Don’t:
- **No Dividers:** Never use horizontal lines to separate list items. Use a `0.7rem` gap and a subtle background shift (`surface-container-low`) on hover.
- **No Pure Black:** Never use #000000. Use `on_background` (#1b1c1a) for text to maintain the "warm" humanitarian tone.
- **No Sharp Corners:** Every element must have at least a `sm` (4px) radius to maintain the "Soft/Warm" brand personality.

---

## 7. Spacing & Rhythm
The spacing scale is non-linear to encourage high-contrast layouts.
- Use **Small Scales (0.5 - 2)** for micro-adjustments within components.
- Use **Macro Scales (16 - 24)** for section margins. 
- *Pro-tip:* If a section feels "crowded," double the vertical padding. Luxury is found in the space you *don't* fill.