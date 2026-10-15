"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { company, hero } from "@/lib/content";
import { INTRO_SEEN_KEY, setIntroStage, useIntroStage, useLoadMilestone } from "@/lib/journey";

/**
 * Opening sequence over the 3D view: brand mark and a progress line while
 * the scene loads, then a location label over the aerial shot, cleared as
 * the camera descends. The line follows real loading milestones (bundle
 * requested, bundle loaded, scene created, shaders compiled); there is
 * deliberately no percentage, since those milestones are coarse.
 */
export function IntroOverlay() {
  const stage = useIntroStage();
  const load = useLoadMilestone();
  const [gone, setGone] = useState(false);

  // The inline head script marks repeat visits and reduced motion as
  // intro-done before first paint, so the overlay never flashes for them.
  useEffect(() => {
    if (document.documentElement.classList.contains("intro-done")) setIntroStage("done");
  }, []);

  useEffect(() => {
    if (stage !== "done") return;
    document.documentElement.classList.add("intro-done");
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Storage can be unavailable (private mode); the intro just replays.
    }
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [stage]);

  if (gone) return null;

  const loading = stage === "loading";
  const labelVisible = stage === "aerial";

  return (
    <div
      aria-hidden="true"
      className={`intro-overlay pointer-events-none fixed inset-0 z-[70] transition-[background-color,opacity] duration-700 ${
        loading ? "bg-ivory" : "bg-transparent"
      } ${stage === "done" ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image src="/brand/shield.png" alt="" width={327} height={400} priority className="h-20 w-auto" />
      </div>

      <div
        className={`absolute inset-x-0 top-[38%] flex flex-col items-center text-center transition-[opacity,filter] duration-700 ${
          labelVisible ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
      >
        <p className="eyebrow">{hero.location}</p>
        <p className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">{company.shortName}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-ink/10">
        <div
          className="h-full origin-left bg-gold-deep transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${load})` }}
        />
      </div>
    </div>
  );
}
