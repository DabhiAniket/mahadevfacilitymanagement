"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { beats, PROPERTY_NAME, PROPERTY_PLACE, srcFor, visualById, visuals, type Visual } from "@/data/visuals";
import { INTRO_SEEN_KEY, setIntroStage, setLoadMilestone, useJourneyMaxStep, useJourneyStep } from "@/lib/journey";

const PhotoScene = dynamic(() => import("./three/PhotoScene"), {
  ssr: false,
  loading: () => null,
});

// If the WebGL view is not ready by then, show the copy anyway.
const INTRO_TIMEOUT_MS = 4000;

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

function saveData() {
  return !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
}

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

let webgl: boolean | null = null;
const getWebGL = () => (webgl ??= hasWebGL());
const subscribeNever = () => () => {};

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Crop for both breakpoints, applied as object-position by CSS. */
const cropVars = (v: Visual) =>
  ({
    "--pos-wide": `${v.focal.wide.x * 100}% ${v.focal.wide.y * 100}%`,
    "--pos-tall": `${v.focal.tall.x * 100}% ${v.focal.tall.y * 100}%`,
  }) as CSSProperties;

function VisualPicture({
  visual,
  eager = false,
  imgRef,
  className = "",
}: {
  visual: Visual;
  eager?: boolean;
  imgRef?: React.Ref<HTMLImageElement>;
  className?: string;
}) {
  const set = (format: "avif" | "webp") => visual.widths.map((w) => `${srcFor(visual, w, format)} ${w}w`).join(", ");
  const largest = Math.max(...visual.widths);
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes="100vw" />
      <source type="image/webp" srcSet={set("webp")} sizes="100vw" />
      {/* Plain <picture>: files are pre-optimised AVIF/WebP with explicit sizes. */}
      <img
        ref={imgRef}
        src={srcFor(visual, largest, "webp")}
        width={visual.width}
        height={visual.height}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className={`stage-img ${className}`}
        style={cropVars(visual)}
      />
    </picture>
  );
}

/**
 * The visual layer of the journey stage. A real <img> of the first beat is
 * always rendered (server-side, high priority), so the first frame is never
 * blank. With WebGL, PhotoScene fades in over it with identical framing and
 * takes over the motion. Without WebGL, with reduced motion or Save-Data,
 * static images cross-fade between beats instead.
 */
export function JourneyCanvas() {
  const [ready, setReady] = useState(false);
  const [heroImage, setHeroImage] = useState<HTMLImageElement | null>(null);
  const heroRef = useRef<HTMLImageElement>(null);
  // null during server render and hydration.
  const gl = useSyncExternalStore(subscribeNever, getWebGL, () => null);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
  const mode = gl === null ? "pending" : gl && !reduced && !saveData() ? "webgl" : "static";
  const step = useJourneyStep();
  const heroVisual = visualById(beats[0].visual);
  const activeVisual = beats[Math.min(Math.max(step, 0), beats.length - 1)].visual;

  // Static mode: image layers mount for every beat reached so far plus the
  // next one, so later images load as you approach them.
  const maxStep = useJourneyMaxStep();
  const mounted = new Set(
    beats.filter((_, i) => i <= Math.max(maxStep, step) + 1 || Math.abs(i - step) <= 1).map((b) => b.visual),
  );

  // Fetch the WebGL code while the hero image loads.
  useEffect(() => {
    if (mode === "webgl") void import("./three/PhotoScene");
  }, [mode]);

  // Wait for the hero <img> before starting WebGL so its file is reused.
  useEffect(() => {
    const img = heroRef.current;
    if (!img) return;
    const done = () => {
      setLoadMilestone(0.4);
      setHeroImage(img);
    };
    if (img.complete && img.naturalWidth) queueMicrotask(done);
    else img.addEventListener("load", done, { once: true });
    return () => img.removeEventListener("load", done);
  }, []);

  // The hero copy waits for the WebGL view, at most INTRO_TIMEOUT_MS; it is
  // immediate in static mode, on repeat visits and when opened part-way down.
  useEffect(() => {
    if (mode === "pending") return;
    if (mode === "static" || introSeen() || window.scrollY > 0 || window.location.hash.length > 1) {
      setIntroStage("done");
      return;
    }
    setLoadMilestone(0.2);
    const timeout = window.setTimeout(() => setIntroStage("done"), INTRO_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  const label = visualById(activeVisual);
  const credit = label.permissionStatus === "granted" && label.credit ? ` · ${label.credit}` : "";

  return (
    <div className="stage-visual" aria-hidden="true">
      <div className={`stage-layer ${mode !== "static" || activeVisual === heroVisual.id ? "is-active" : ""}`}>
        <VisualPicture visual={heroVisual} eager imgRef={heroRef} />
      </div>

      {mode === "static" &&
        visuals
          .filter((v) => v.id !== heroVisual.id && mounted.has(v.id))
          .map((v) => (
            <div key={v.id} className={`stage-layer ${activeVisual === v.id ? "is-active" : ""}`}>
              <VisualPicture visual={v} />
            </div>
          ))}

      {mode === "webgl" && heroImage && (
        <div className={`stage-canvas ${ready ? "is-ready" : ""}`}>
          <PhotoScene
            heroImage={heroImage}
            onReady={() => {
              setReady(true);
              setIntroStage("done");
            }}
          />
        </div>
      )}

      <p className="journey-label">
        {PROPERTY_NAME}, {PROPERTY_PLACE} · Architectural visualisation{credit}
      </p>
    </div>
  );
}
