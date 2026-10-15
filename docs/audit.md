# Audit before the Oscar Sky Park visual update

Snapshot of commit `70e372d` on 2026-10-15, taken before any change for this task.

## Files

| Concern | File | What it does |
| --- | --- | --- |
| 3D scene | `src/components/three/SocietyScene.tsx` (915 lines) | Procedural low-poly society (two box towers, lobby, apartment, gate, garden, pool, tanks), cloud intro layer, camera rig with one shot per journey step |
| Canvas wrapper | `src/components/JourneyCanvas.tsx` | Lazy-loads the scene with `next/dynamic`, WebGL / low-power / reduced-motion detection, intro skip rules, no-WebGL fallback (logo shield) |
| ScrollTrigger timeline | `src/components/JourneyController.tsx` | One master `ScrollTrigger` over `#journey`; maps scroll to a continuous step index from `[data-journey-step]` spacers; drives text blocks (`[data-step-text]`), progress line and scroll cue |
| Shared state | `src/lib/journey.ts` | Step list (`JOURNEY_STEPS`: hero + 6 services), position, intro stage, loading milestones |
| Loader / intro | `src/components/IntroOverlay.tsx` | Ivory loading screen with logo and milestone line, aerial label, sets `html.intro-done` |
| Hero text | `src/app/page.tsx` (hero block inside `.journey-stage`) | Eyebrow, H1 tagline, subline, summary, two buttons; services blocks follow |
| Boot script | `src/app/layout.tsx` | Sets `html.js`, early `intro-done`, 9 s hydration failsafe |
| Styles | `src/app/globals.css` | Stage, scrim, `.stage-backdrop` text panels, hero entrance keyframes |

## Structure

`#journey` contains a sticky full-screen `.journey-stage` (canvas, scrim, text blocks, progress line, cue) followed by invisible spacers: 100 svh for the hero, 150 svh per service. The canvas renders on demand only.

## Issues found that this task must fix

| Issue | Where |
| --- | --- |
| Buildings are generic low-poly boxes | `SocietyScene.tsx` |
| Text blurs during cross-fades (`filter: blur` up to 10 px) and uses fractional `translate3d` values | `JourneyController.tsx` `paint()` |
| Hero entrance animates `filter: blur(8px)` on text | `globals.css` `@keyframes blur-in` |
| `backdrop-filter` behind header text and menu button | `SiteHeader.tsx` (`backdrop-blur-sm`) |
| Intro label uses `blur-sm` | `IntroOverlay.tsx` |
| Loader shows a blank ivory screen until the scene compiles | `IntroOverlay.tsx` |

## Image search

No Oscar Sky Park image supplied by the user was found in `/public`, `/public/source`, `/assets`, the repo root, `~/Downloads`, `~/Desktop` or `~/Pictures`.
