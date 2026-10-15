// Shared, render-free state between the scroll controller (DOM, GSAP), the
// intro overlay and the 3D scene (R3F). Writes notify subscribers; React only
// re-renders in components that opt in through the hooks below.
import { useSyncExternalStore } from "react";

/** sessionStorage key: the intro plays once per browser session. */
export const INTRO_SEEN_KEY = "mfm-intro-seen";

type IntroStage = "loading" | "done";

type Listener = () => void;

const state = {
  /** Continuous position along the journey (beat index; beats are in src/data/visuals.ts). */
  position: 0,
  /** Nearest whole step. */
  step: 0,
  /** Scroll position as a step index without the camera holds (drives the image dolly). */
  raw: 0,
  /** Furthest step reached so far (static image layers mount up to here). */
  maxStep: 0,
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

export function setJourneyPosition(position: number, raw: number) {
  const step = Math.round(position);
  if (position === state.position && raw === state.raw) return;
  state.position = position;
  state.step = step;
  state.raw = raw;
  state.maxStep = Math.max(state.maxStep, step);
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

export function useJourneyStep() {
  return useSyncExternalStore(
    subscribeJourney,
    () => state.step,
    () => 0,
  );
}

export function useJourneyMaxStep() {
  return useSyncExternalStore(
    subscribeJourney,
    () => state.maxStep,
    () => 0,
  );
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
