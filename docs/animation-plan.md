# Animation plan

Modelled on the reference recording (`reference-analysis.md`), with Mahadev's content and theme. Every effect has a job; there is no cursor animation, no counters and no decorative parallax.

## Intro (first visit per browser session)

1. **Loading**: ivory screen, brand shield, a thin gold line at the bottom that moves at real milestones (bundle requested 0.2, loaded 0.6, scene created 0.8, shaders compiled 1.0).
2. **Aerial** (0.9 s): the scene fades in, seen from 150 m above a cloud layer, with a gold ring around the society and the label "Rajkot, Gujarat / Mahadev Facility Management".
3. **Descent** (3 s, ease in-out): the camera flies down through the clouds on a curved path to the hero shot. The label and line fade.
4. **Done**: `html.intro-done` is set. The header fades in, the headline rises line by line, the rest blur-fades in, and the clouds fade away and stop rendering.

Skipped (straight to step 4) for: reduced motion, no WebGL, low-power devices, repeat visits in the same session, and pages opened at an anchor or part-way down. If the 3D view is not ready within 7 s the intro is skipped too. A boot script in `<head>` handles the cases it can see before first paint, so the overlay never flashes for them.

## Journey

A single canvas is pinned full-screen (sticky) behind the hero and the six services. Below it, invisible spacers give the scroll length: 100 svh for the hero, 150 svh per service. Each spacer has an anchor id, so menu links and "Explore Our Services" still jump to the right place.

| Step | Copy | Camera |
| --- | --- | --- |
| 0 | Hero | Eye level at the street, framed by foreground trees, looking up at both towers |
| 1 | 01 Society Management Services | Aerial three-quarter view of the whole compound |
| 2 | 02 Housekeeping Services | Through the lobby glass into the lobby (curved path) |
| 3 | 03 Garden Maintenance Service | Back out through the glass, low over the lawn |
| 4 | 04 Swimming Pool Maintenance | Over the pool and deck |
| 5 | 05 Water Tank Cleaning | Up to the rooftop tanks on tower B |
| 6 | 06 Residential Unit Deep Cleaning | Down and through the lit window into the apartment (curved path) |

### Mechanics

- `JourneyController`: **one** GSAP ScrollTrigger across the journey. It measures each spacer's centre and maps scroll to a continuous step index. Between steps the camera holds for the first and last 20% and travels in the middle 60% (smoothstep).
- The same index drives the copy: each block is fully visible at its step and gone 0.42 steps away, blurring up to 10 px and drifting 28 px, so blocks dip through a blur like the reference.
- The scene reads the index from a small external store (`src/lib/journey.ts`). React does not re-render on scroll. The camera follows with exponential damping; segments with a control point (`via`) follow a quadratic curve, which is how it enters the lobby and the apartment through their glass.
- `frameloop="demand"`: frames render only while the camera moves.
- Wide screens: the view is offset so the subject sits right of the copy. Portrait screens: the subject sits in the upper part and the camera pulls back (except inside rooms).
- A thin gold line at the left fills with progress; "(Scroll to discover)" shows until the last step.

### Legibility

Copy over 3D imagery cannot rely on the scene's colours. A light global scrim plus a soft dark panel behind each block (`.stage-backdrop`) keep every text element at WCAG AA. This was measured from screenshots with the text hidden: 130 elements at 1440, 834 and 390 px, lowest margin 1.05x the requirement.

## Reduced motion

No intro, no camera travel (the shot changes in one cut at each midpoint), no blur or drift (opacity only), no headline rise.

## Fallbacks

- No WebGL: dark stage with the logo shield; copy and anchors unchanged.
- No JavaScript: the stage becomes a normal document section; spacers and decorations are hidden.
- Script failure: if the app has not hydrated after 9 s, the boot script drops back to the no-JavaScript layout.

## Where better models can go

Replace with glTF models (Draco or Meshopt, KTX2 textures) via drei `useGLTF`: `Tower`, `Lobby`, `Apartment`, `BoundaryAndGate`, `Grounds`, `RooftopTanks`. Keep `SHOTS` coordinates in sync.

## Lenis

Not used. Native scrolling keeps anchors, keyboard scrolling and find-in-page working, and the camera damping already smooths motion.
