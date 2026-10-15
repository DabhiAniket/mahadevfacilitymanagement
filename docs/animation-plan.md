# Animation plan

The journey shows real images of Oscar Sky Park (architectural visualisations, see `assets.md`), not modelled buildings. Every effect has a job; there is no cursor animation, no counters, and no blur or depth-of-field anywhere.

## First frame and loading

- The first beat's image is a real `<img>` (`<picture>`, AVIF with WebP fallback, `fetchpriority="high"`, explicit width and height), rendered on the server. There is never a blank frame.
- The WebGL layer loads after that image, reuses the exact file the browser already downloaded as its first texture, and fades in over it with identical framing (same object-position maths), so the hand-over is invisible.
- A thin gold line at the bottom edge follows real milestones (image loaded, WebGL code loaded, first texture ready, first frame drawn). No percentage. When it completes, the header and hero copy appear (or after 4 s at most).
- The other five images load one by one in the background.

## Beats (`src/data/visuals.ts`)

| Beat | Image | Copy | Camera |
| --- | --- | --- | --- |
| Opening exterior | `exterior` | Hero | Push-in 1.00 to 1.06 |
| Approach | `elevation` | "Oscar Sky Park / Approach" | Push-in 1.00 to 1.08 |
| Entrance | `elevation` (continues) | "Entrance" | Push-in 1.08 to 1.18 toward the signed gate |
| Landscaped grounds | `courtyard` | "Landscaped courtyard" | Push-in 1.00 to 1.08 |
| Amenities | `roof-garden` | "Rooftop garden" | Push-in with a slight pan |
| Amenities | `pool` | "Swimming pool" | Push-in 1.00 to 1.08 |
| Services 01 to 06 | `courtyard-dusk` | Each service's own copy | One slow continuous pan and push across all six |

Consecutive beats on the same image chain their framing, so there is no cut.

## Motion

- **ScrollTrigger**: the existing single master trigger. It now publishes two values: the held position (camera rests while copy is readable; drives the copy) and the raw position (drives the image dolly continuously, so the image keeps moving slowly while you scroll).
- **Dolly**: zoom and focal point interpolate across each beat with scroll, damped (exponential, no jumps).
- **Masked dissolve** between different images: a soft diagonal sweep broken up by low-frequency noise, over 44% of the distance between two beats.
- **Layer parallax**: during a dissolve the outgoing image keeps pushing in (+5%) while the incoming one settles from +3.5%, so the two layers move at different rates. Depth inside a single image is not faked; that would bend the building's vertical lines.
- **Grade**: slightly warm, slightly more contrast, gentle vignette. Applied in the shader; no post-processing passes.
- **Anchor jumps** (menu links): instead of racing through every image in between, the view dissolves straight from the current image to the target in 0.8 s.
- **Copy**: opacity only, fully solid within 0.12 steps of its beat and gone by 0.34. Never blurred or transformed, so text is sharp at every scroll position.

## Framing per breakpoint

- Landscape screens: full-bleed image, copy bottom-left on a scrim and soft panel.
- Portrait screens (phones, portrait tablets): image fills the top part of the screen, copy sits below on solid ink. Avoids narrow crops of wide images and keeps text off the image entirely.
- Each image has a `wide` and a `tall` focal point (object-position). CSS and the shader use the same rule to pick one, so DOM and WebGL frames match.

## Reduced motion, no WebGL, Save-Data

Static images: the right image for each beat cross-fades (250 ms with reduced motion), no dolly, copy appears immediately. Image layers mount only as you reach them.

## Performance

AVIF/WebP at 1280 px and the original width (max 2000). Device pixel ratio capped at 1.5 on phones, 1.75 elsewhere. Rendering is on demand only, and stops entirely while the stage is off-screen (IntersectionObserver). Textures, material and geometry are disposed on unmount.
