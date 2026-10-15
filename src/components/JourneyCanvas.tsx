"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { INTRO_SEEN_KEY, setIntroStage, setLoadMilestone } from "@/lib/journey";

const SocietyScene = dynamic(() => import("./three/SocietyScene"), {
  ssr: false,
  loading: () => null,
});

// If the 3D view is not ready by then, skip the intro rather than keep
// visitors waiting.
const INTRO_TIMEOUT_MS = 7000;

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    // Release the probe context so it doesn't count against the browser limit.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function isLowPower() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return true;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 && memory <= 4;
}

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

type Capabilities = { webgl: boolean; lite: boolean };
let capabilities: Capabilities | null = null;
const getCapabilities = () => (capabilities ??= { webgl: hasWebGL(), lite: isLowPower() });
const subscribeNever = () => () => {};

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// Decorative 3D layer behind the hero and services. All meaningful content
// lives in the DOM above it.
export function JourneyCanvas() {
  const [ready, setReady] = useState(false);
  // null during server render and hydration; the scene mounts afterwards.
  const caps = useSyncExternalStore(subscribeNever, getCapabilities, () => null);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
  const mode = caps === null ? "pending" : caps.webgl ? "webgl" : "fallback";
  const lite = caps?.lite ?? false;

  // Decide once whether the aerial intro plays. It is skipped without WebGL,
  // on low-power devices, with reduced motion, on repeat visits in the same
  // session, and when the page opens part-way down (anchor or restored scroll).
  useEffect(() => {
    if (caps === null) return;
    const skip =
      !caps.webgl ||
      caps.lite ||
      window.matchMedia(MOTION_QUERY).matches ||
      introSeen() ||
      window.scrollY > 0 ||
      window.location.hash.length > 1;
    if (skip) {
      setIntroStage("done");
      return;
    }
    setLoadMilestone(0.2);
    const timeout = window.setTimeout(() => setIntroStage("done"), INTRO_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [caps]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {mode === "fallback" ? (
        <div className="flex h-full items-center justify-end bg-gradient-to-br from-ink-2 to-ink pr-[8vw] max-md:items-start max-md:justify-center max-md:pt-[18vh] max-md:pr-0">
          <Image
            src="/brand/shield.png"
            alt=""
            width={327}
            height={400}
            className="h-auto w-[min(28vw,240px)] opacity-30"
          />
        </div>
      ) : (
        <div className={`h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          {mode === "webgl" && <SocietyScene lite={lite} reduced={reduced} onReady={() => setReady(true)} />}
        </div>
      )}
    </div>
  );
}
