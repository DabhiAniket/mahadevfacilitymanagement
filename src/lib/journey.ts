// Shared, render-free state between the scroll controller (DOM, GSAP), the
// intro overlay and the 3D scene (R3F). Writes notify subscribers; React only
// re-renders in components that opt in through the hooks below.
import { useSyncExternalStore } from "react";

// One camera shot per spacer marked with data-journey-step, in this order.
export const JOURNEY_STEPS = [
  "hero",
  "society-management",
  "housekeeping",
  "garden-maintenance",
  "swimming-pool-maintenance",
  "water-tank-cleaning",
  "residential-deep-cleaning",
] as const;

/** sessionStorage key: the intro plays once per browser session. */
export const INTRO_SEEN_KEY = "mfm-intro-seen";

export type IntroStage = "loading" | "aerial" | "descending" | "done";

type Listener = () => void;

const state = {
  /** Continuous position along the journey, 0..JOURNEY_STEPS.length - 1. */
  position: 0,
  /** Nearest whole step. */
  step: 0,
  /** Intro sequence stage. */
  intro: "loading" as IntroStage,
  /** Real loading milestones of the 3D view, 0..1 (coarse, not a percentage). */
  load: 0,
};

const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function getJourney() {
  return state;
}

export function setJourneyPosition(position: number) {
  const step = Math.round(position);
  if (position === state.position && step === state.step) return;
  state.position = position;
  state.step = step;
  emit();
}

export function setIntroStage(intro: IntroStage) {
  if (state.intro === intro || state.intro === "done") return;
  state.intro = intro;
  emit();
}

/** Loading milestones only move forward. */
export function setLoadMilestone(load: number) {
  if (load <= state.load) return;
  state.load = load;
  emit();
}

export function subscribeJourney(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useIntroStage() {
  return useSyncExternalStore(
    subscribeJourney,
    () => state.intro,
    () => "loading" as IntroStage,
  );
}

export function useLoadMilestone() {
  return useSyncExternalStore(
    subscribeJourney,
    () => state.load,
    () => 0,
  );
}
