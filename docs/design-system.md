# Design system

## Starting point

Mahadev's real brand is the logo: gold (#C8A060, sampled from the original file) and white on black. The live site uses pure black with white text.

The brief asks not to default to black-and-gold luxury, and to avoid heavy darkness. So the system keeps the real gold and the near-black of the logo, and moves most of the page onto warm light neutrals tinted toward the gold. The dark ink surface returns only for the final Contact section and footer, where the original-colour logo sits naturally.

## Colour tokens

Defined in `src/app/globals.css` as CSS variables and exposed to Tailwind (`bg-ivory`, `text-gold-deep`, and so on).

| Token | Hex | Role |
| --- | --- | --- |
| `--color-ink` | #17140F | Text on light; dark surface. Warm near-black from the logo ground |
| `--color-ink-2` | #221E17 | Raised dark surface |
| `--color-ivory` | #F6F2EA | Page background; 3D sky and fog |
| `--color-stone` | #ECE4D6 | Secondary surface (Properties) |
| `--color-paper` | #FFFDF9 | Card surface |
| `--color-line` | #D8CDB9 | Hairlines on light |
| `--color-line-dark` | #3A3328 | Hairlines on ink |
| `--color-muted` | #5B5347 | Secondary text on light |
| `--color-muted-on-dark` | #BDB3A2 | Secondary text on ink |
| `--color-gold` | #C8A060 | Logo gold. Decorative on light; text allowed on ink |
| `--color-gold-deep` | #7D5E27 | Gold for small text on light (eyebrows, numbers) |
| `--color-slate` | #2A4658 | Complementary accent |
| `--color-focus` | #1F5FA8 | Focus outline on light (gold on ink) |
| `--color-success` | #2E6B3E | Success state (reserved; no forms yet) |
| `--color-error` | #A8352A | Error state (reserved; no forms yet) |

**Why slate as the accent.** The logo gold sits at a hue of about 37 degrees; its complement is a blue near 217 degrees. A desaturated, dark slate blue (#2A4658) is the complement, ties to water (pools, tanks) in the 3D scene, and works as a hover state for the primary button without introducing a new bright colour.

## Contrast (WCAG 2.x)

Calculated with the WCAG relative-luminance formula.

| Foreground | on Ivory | on Stone | on White | on Ink |
| --- | --- | --- | --- | --- |
| Ink #17140F | 16.45 | 14.55 | 18.37 | n/a |
| Muted #5B5347 | **6.78** | **6.00** | 7.57 | 2.43 (not used) |
| Gold #C8A060 | 2.17 (decorative only) | 1.92 (decorative only) | 2.43 | **7.57** |
| Gold deep #7D5E27 | **5.37** | **4.75** | 6.00 | 3.06 (not used) |
| Slate #2A4658 | 8.89 | 7.86 | 9.93 | n/a |
| Focus #1F5FA8 | 5.77 | 5.10 | 6.44 | n/a |
| Success #2E6B3E | 5.72 | 5.06 | 6.39 | n/a |
| Error #A8352A | 5.86 | 5.19 | 6.55 | n/a |
| Ivory #F6F2EA | n/a | n/a | n/a | **16.45** |
| Muted on dark #BDB3A2 | n/a | n/a | n/a | **8.86** |

Every text pairing in use passes AA (4.5:1). axe-core reported no colour-contrast violations on any page at 1440 and 390 px.

## Typography

- **Display: Cormorant Garamond** (500, 600). A classical serif that sits comfortably beside the logo's flared serif wordmark without imitating it.
- **Text: Manrope** (variable). A clean geometric sans echoing the tracked "PRIVATE LIMITED" line of the logo; used tracked and uppercase for eyebrows.
- Both are loaded with `next/font/google`, which downloads them at build time and serves them from this site (`display: swap`). No requests go to Google at runtime.
- The site is English only, matching the live site, so only the Latin subset is loaded. If Gujarati or Hindi content is added, add a matching face (for example Noto Serif Gujarati) rather than relying on fallbacks.

## Shape and components

- Buttons: square corners (2 px radius), 48 px tall. Never pill-shaped.
- Primary button: ink on ivory text, hover slate. Secondary: 1 px ink outline, hover fills ink.
- Cards over the 3D scene: ivory at 95% opacity with a hairline border, so text contrast does not depend on what the camera shows.
- Focus: 2 px outline with 3 px offset, focus blue on light and gold on ink.
- Touch targets: at least 44 x 44 px for every link and button (checked in the browser).

## Logo files

Generated from the original JPEG (`docs/source-assets/`) without redrawing:

- `public/brand/logo-on-dark.webp`: original colours, transparent background.
- `public/brand/logo-on-light.(png|webp)`: same, with only the white lettering recoloured to ink. Gold is unchanged.
- `src/app/icon.png`, `apple-icon.png`, `favicon.ico`: shield on black, matching the original.
- `src/app/opengraph-image.png`: banner logo on black, 1200 x 630.

Ask the company for a vector (SVG or AI) logo; the raster derivatives are good but a vector master is better.

## Text over the 3D stage

The hero and service copy sits on the 3D view, as in the reference. It uses ivory text with:

- a light scrim on the bottom, left and top edges (`.journey-scrim`), and
- a soft ink panel behind each block (`.stage-backdrop`: 56% ink plus a 90 px blurred shadow), so contrast does not depend on what the camera shows.

Measured against screenshots with the text hidden, every stage text element passes AA (4.5:1 body, 3:1 large) at 1440, 834 and 390 px; the tightest is the hero eyebrow at 4.70:1.

## Header

MENU (left), centred logo, Call (right). Over the stage it is transparent with the original-colour logo; over the light sections it becomes a solid ivory bar with the ink logo. The menu opens a full-screen ink panel; the page behind is made `inert` while it is open.
