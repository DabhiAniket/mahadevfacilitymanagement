"use client";

import { useEffect, useState } from "react";
import { INTRO_SEEN_KEY, setIntroStage, useIntroStage, useLoadMilestone } from "@/lib/journey";

/**
 * Loading indicator over the real hero image: a thin line along the bottom
 * edge that follows real milestones (hero image loaded, WebGL code loaded,
 * first texture ready, first frame drawn). No percentage, since those
 * milestones are coarse. When it completes, html.intro-done reveals the
 * hero copy and header.
 */
export function IntroOverlay() {
  const stage = useIntroStage();
  const load = useLoadMilestone();
  const [gone, setGone] = useState(false);

  // The inline head script marks repeat visits and reduced motion as
  // intro-done before first paint.
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
    const t = window.setTimeout(() => setGone(true), 700);
    return () => window.clearTimeout(t);
  }, [stage]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`intro-overlay pointer-events-none fixed inset-x-0 bottom-0 z-[70] h-0.5 bg-ivory/20 transition-opacity duration-500 ${
        stage === "done" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="h-full origin-left bg-gold transition-transform duration-500 ease-out"
        style={{ transform: `scaleX(${stage === "done" ? 1 : load})` }}
      />
    </div>
  );
}
