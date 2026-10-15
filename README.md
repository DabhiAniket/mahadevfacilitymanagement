# Mahadev Facility Management website

Rebuild of www.mahadevfacilitymanagement.com (previously on Wix) as a Next.js site with one scroll-driven 3D scene, modelled on the reference recording described in `docs/reference-analysis.md`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint
```

Requires Node 20 or newer. Set `NEXT_PUBLIC_SITE_URL` to the final origin (default `https://www.mahadevfacilitymanagement.com`); it is used for canonical URLs, Open Graph, the sitemap and structured data.

## Stack

| Package | Why |
| --- | --- |
| Next.js 16 (App Router), TypeScript | Static pages, metadata, image and font optimisation, redirects for old Wix URLs |
| Tailwind CSS 4 | Styling; brand colours are CSS variables in `src/app/globals.css` |
| three, @react-three/fiber, @react-three/drei | The single 3D scene; drei supplies `Instances` (windows, trees, floor bands in few draw calls) and `ContactShadows` (rendered once) |
| gsap, @gsap/react | One ScrollTrigger maps scroll position to the camera journey; `useGSAP` handles cleanup |
| motion | Mobile menu open and close transition |

Lenis was considered and left out; see `docs/animation-plan.md`.

## Where things are

- `src/lib/content.ts`: all copy, verbatim from the old site, plus contact details. Edit text here.
- `src/app/page.tsx`: home page sections.
- `src/components/three/SocietyScene.tsx`: the 3D scene and camera shots.
- `src/components/JourneyController.tsx`: scroll to camera and text mapping.
- `src/components/IntroOverlay.tsx`: opening loader and aerial label.
- `src/app/privacy-policy`, `terms-and-conditions`, `accessibility-statement`: legal pages (drafts).
- `docs/`: site inventory, reference analysis, animation plan, design system, launch checklist, live-site screenshots and original logo files.

## Before launch

See `docs/launch-checklist.md`.
