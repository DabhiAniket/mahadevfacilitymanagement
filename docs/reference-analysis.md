# Reference analysis

## Sources

1. Instagram Reel https://www.instagram.com/reel/DbORBRzBCyJ/ (`polanaeem.tech`): only its cover frame was viewable (a residential tower site with a vertical "STREET LEVEL" rail).
2. **Screen recording `web3d.mp4` (21.4 s, 1600 x 1200)**, supplied 2026-10-15. It shows a site called "KOYA Residences". ffmpeg is not installed on this machine, so frames were extracted by playing the file in headless Chrome and drawing it to a canvas: one frame per second (22), every 0.25 s around each transition (32), and five at 1000 px height for typography.

## VERIFIED (seen in the recording)

| Time | What happens |
| --- | --- |
| 0.0 to 0.5 s | Hero cross-fades into a loader (the recording loops) |
| 0.5 to 4.5 s | **Loader**: aerial view of terrain under drifting clouds, a ring marker on the site with a small label, a large percentage counter at the bottom right (26, 31, 33 ... 100) and a progress line along the bottom edge |
| 4.5 to 5.0 s | The cloud layer breaks up and the building is revealed through it |
| 5.25 to 6.0 s | Hero copy appears with a blur-to-sharp fade |
| 6 to 7 s | **Hero**: full-bleed eye-level shot, foliage in the foreground, two towers. Large uppercase sans headline at left ("REFINED LIVING REDEFINED"), short paragraph, "KNOW MORE" pill button, "(SCROLL TO DISCOVER)" bottom right. Header: MENU pill left, centred logo, ENQUIRE pill right, both translucent |
| 8 to 10 s | **01 "Smart by design"**: camera orbits to an aerial three-quarter view of the building in its block |
| 10.25 to 11.25 s | Camera dives toward the roof (solar panels) and passes through it |
| 11.5 to 14.5 s | **02 "Effortless living"**: apartment interior, slow dolly |
| 14.75 to 15.25 s | Camera passes through columns and glazing to the outside |
| 15.5 to 21 s | **03 "Spaces to connect"**: camera pulls back to reveal the full facade |
| Throughout | Section copy sits bottom-left: number, title, one paragraph, button. A thin vertical line runs at the left of the copy. Copy changes by blurring out and in, with a short gap where neither is readable. Imagery is photoreal and pre-rendered |

## ASSUMPTIONS

- That scroll drives the sequence (the recording does not show a scrollbar or input). The "(SCROLL TO DISCOVER)" cue supports it.
- That the imagery is a scroll-scrubbed video or image sequence rather than real-time 3D. The photoreal quality suggests it.

## Reference to implementation

| Observed | Implementation in this site | Difference and why |
| --- | --- | --- |
| Aerial loader with clouds and ring marker | Real-time aerial view of Mahadev's society from 150 m, cloud sprites, gold ring, label "Rajkot, Gujarat / Mahadev Facility Management" | Same idea, own content |
| Large % counter | Brand shield plus a progress line that follows real loading milestones (bundle requested, loaded, scene created, shaders compiled) | **No percentage.** The milestones are coarse, so any number would be invented (your rule: no fake counters) |
| Clouds part to reveal the building | Camera descends through the cloud layer on a curved path to the hero shot (3 s) | Real fly-through instead of a 2D dissolve |
| Hero copy blur-fades in | Headline lines rise from a mask, then the rest blur-fades in, after the descent | Matches |
| Eye-level hero with foreground foliage | Eye-level hero shot framed by foreground trees | Matches |
| MENU / logo / ENQUIRE header | MENU left, centred logo, Call button right; full-screen menu panel | Square buttons, not pills (your rule) |
| 01 aerial orbit | 01 Society Management: aerial three-quarter view of the whole compound | Matches |
| Dive through roof into an interior | 02 Housekeeping: camera flies through the lobby glass into the lobby | Same "pass through into an interior" move |
| Interior dolly | 06 Residential Unit Deep Cleaning: camera flies through the lit window into a furnished apartment | Matches |
| Pass through glazing, pull back | Leaving the lobby back through the glass to the garden | Matches |
| Bottom-left copy with number and left line | Bottom-left copy: "Our Services", number, title, verbatim service text; thin gold progress line at the left fills as you go | Per-service "KNOW MORE" buttons left out: there are no service detail pages to link to |
| Blur cross-fade between sections | Copy blurs out and in, driven by scroll, with a short gap at the midpoint | Matches |
| Photoreal renders | Stylised real-time scene built from primitives | No licensed models or real photos exist, and AI imagery is ruled out. Real models can replace the parts listed in `animation-plan.md` |
