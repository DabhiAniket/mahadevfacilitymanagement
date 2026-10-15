"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getJourney, setJourneyPosition, subscribeJourney } from "@/lib/journey";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Holds the camera while a step is centred and moves it between steps: the
// middle 60% of each gap is travel, the rest is rest.
const travel = (t: number) => smooth(clamp01((t - 0.2) / 0.6));

// A text block is fully visible at its own step and gone 0.42 steps away, so
// neighbouring blocks dip through a blur rather than overlapping.
const FADE_SPAN = 0.42;

/**
 * One master ScrollTrigger spanning the pinned journey. It maps scroll
 * position onto a continuous step index from the measured spacers
 * ([data-journey-step]), publishes it for the 3D camera, and drives the
 * overlaid text blocks ([data-step-text]), progress line and scroll cue.
 */
export function JourneyController({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      (window as Window & { __mfmHydrated?: boolean }).__mfmHydrated = true;

      const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-journey-step]"));
      const blocks = Array.from(el.querySelectorAll<HTMLElement>("[data-step-text]"));
      const progress = el.querySelector<HTMLElement>("[data-journey-progress]");
      const cue = el.querySelector<HTMLElement>("[data-scroll-cue]");
      const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const last = steps.length - 1;
      let anchors: number[] = [];

      const measure = () => {
        const vh = window.innerHeight;
        anchors = steps.map((s) => {
          const rect = s.getBoundingClientRect();
          // Middle of the scroll range in which this spacer covers the viewport.
          return rect.top + window.scrollY + (rect.height - vh) / 2;
        });
      };

      const paint = () => {
        const { position, intro } = getJourney();
        const reduced = reducedQuery.matches;
        blocks.forEach((block, i) => {
          const d = position - i;
          let o = clamp01(1 - Math.abs(d) / FADE_SPAN);
          // The hero copy waits for the intro to finish.
          if (i === 0 && intro !== "done") o = 0;
          block.style.opacity = String(o);
          block.style.pointerEvents = o > 0.6 ? "auto" : "none";
          if (reduced) {
            block.style.filter = "";
            block.style.transform = "";
          } else {
            block.style.filter = o < 1 ? `blur(${((1 - o) * 10).toFixed(2)}px)` : "";
            block.style.transform = `translate3d(0, ${(-d * 28).toFixed(1)}px, 0)`;
          }
        });
        if (progress) progress.style.transform = `scaleY(${last > 0 ? position / last : 0})`;
        if (cue) cue.style.opacity = intro === "done" && position < last - 0.5 ? "1" : "0";
      };

      const update = () => {
        if (anchors.length < 2) return;
        const y = window.scrollY;
        let position = 0;
        if (y >= anchors[last]) position = last;
        else if (y > anchors[0]) {
          let i = 0;
          while (i < last - 1 && y >= anchors[i + 1]) i++;
          const t = (y - anchors[i]) / Math.max(anchors[i + 1] - anchors[i], 1);
          // Reduced motion: no scrubbed travel, the step changes at the midpoint.
          position = i + (reducedQuery.matches ? Math.round(t) : travel(t));
        }
        setJourneyPosition(position);
        paint();
      };

      // Keyboard users: focusing something in an off-screen block scrolls to it.
      const onFocusIn = (e: FocusEvent) => {
        const i = blocks.findIndex((b) => b.contains(e.target as Node));
        if (i < 0 || Math.round(getJourney().position) === i) return;
        window.scrollTo({ top: anchors[i], behavior: "auto" });
      };

      measure();
      update();

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: update,
        onRefresh: () => {
          measure();
          update();
        },
      });

      const unsubscribe = subscribeJourney(paint);
      el.addEventListener("focusin", onFocusIn);
      reducedQuery.addEventListener("change", update);
      return () => {
        unsubscribe();
        el.removeEventListener("focusin", onFocusIn);
        reducedQuery.removeEventListener("change", update);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} id="journey" className="relative">
      {children}
    </div>
  );
}
