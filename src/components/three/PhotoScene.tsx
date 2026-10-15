"use client";

// Real images of Oscar Sky Park on a full-frame textured quad. The camera
// framing (zoom and focal point) follows scroll for a slow dolly; between
// beats with different images, a masked dissolve blends them while the
// outgoing layer keeps pushing in faster than the incoming one settles,
// so the two layers move at different rates. Images, crops and beats all
// come from src/data/visuals.ts.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { beats, srcFor, visualById, visuals, type Frame, type Visual } from "@/data/visuals";
import { getJourney, setLoadMilestone, subscribeJourney } from "@/lib/journey";

/** Same rule as the CSS (max-aspect-ratio: 2/3): portrait phones use the tall crop. */
export const TALL_VIEWPORT = 2 / 3;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Cover-fit with CSS object-position semantics, zoom, masked dissolve and a
// light grade. No blur or depth-of-field.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uAspA;
  uniform float uAspB;
  uniform float uView;
  uniform vec3 uFrameA; // zoom, focal x, focal y (y measured from the bottom)
  uniform vec3 uFrameB;
  uniform float uMix;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, float imgAsp, vec3 f) {
    vec2 size = uView > imgAsp ? vec2(1.0, imgAsp / uView) : vec2(uView / imgAsp, 1.0);
    size /= f.x;
    vec2 start = f.yz * (1.0 - size);
    return start + uv * size;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec3 a = texture2D(uTexA, coverUv(vUv, uAspA, uFrameA)).rgb;
    vec3 col = a;
    if (uMix > 0.0) {
      vec3 b = texture2D(uTexB, coverUv(vUv, uAspB, uFrameB)).rgb;
      // Soft diagonal sweep broken up by low-frequency noise.
      float m = (vUv.x * 0.6 + (1.0 - vUv.y) * 0.4) * 0.72 + noise(vUv * vec2(uView, 1.0) * 3.0) * 0.28;
      float t = uMix * 1.3 - 0.15;
      col = mix(b, a, smoothstep(t - 0.12, t + 0.12, m));
    }
    // Light grade: a touch warmer, slightly more contrast, gentle vignette.
    col *= vec3(1.02, 1.0, 0.97);
    col = (col - 0.5) * 1.04 + 0.5;
    vec2 q = (vUv - 0.5) * vec2(max(uView, 1.0), max(1.0 / uView, 1.0));
    col *= mix(0.9, 1.0, smoothstep(0.95, 0.3, length(q)));
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Half-width of the dissolve window around each boundary between beats. */
const DISSOLVE = 0.22;
/** Jumps longer than this (anchor links) dissolve straight to the target. */
const JUMP = 1.5;

type Layer = { visual: Visual; frame: Frame };

function frameAt(beatIndex: number, position: number): Layer {
  const i = Math.min(Math.max(beatIndex, 0), beats.length - 1);
  const beat = beats[i];
  // 0..1 across the beat (extrapolates slightly inside dissolves). The first
  // beat starts at the top of the page, so it runs 0..0.5 and its start frame
  // matches the server-rendered <img> exactly.
  const t = i === 0 ? position * 2 : position - i + 0.5;
  return {
    visual: visualById(beat.visual),
    frame: {
      zoom: lerp(beat.from.zoom, beat.to.zoom, t),
      dx: lerp(beat.from.dx, beat.to.dx, t),
      dy: lerp(beat.from.dy, beat.to.dy, t),
    },
  };
}

/** Image layers to show at a continuous journey position. */
function layersAt(position: number): { a: Layer; b: Layer | null; mix: number } {
  const out = Math.floor(position);
  const boundary = out + 0.5;
  if (Math.abs(position - boundary) < DISSOLVE && out >= 0 && out + 1 < beats.length) {
    const a = frameAt(out, position);
    const b = frameAt(out + 1, position);
    if (a.visual.id !== b.visual.id) {
      const mix = smooth(boundary - DISSOLVE, boundary + DISSOLVE, position);
      a.frame.zoom *= 1 + 0.05 * mix; // outgoing keeps pushing in
      b.frame.zoom *= 1 + 0.035 * (1 - mix); // incoming settles back
      return { a, b, mix };
    }
  }
  return { a: frameAt(Math.round(position), position), b: null, mix: 0 };
}

function pickWidth(v: Visual) {
  const need = Math.min(window.innerWidth, 2048) * Math.min(window.devicePixelRatio || 1, 1.5);
  const sorted = [...v.widths].sort((x, y) => x - y);
  return sorted.find((w) => w >= need) ?? sorted[sorted.length - 1];
}

function loadTexture(url: string) {
  return new THREE.TextureLoader().loadAsync(url).then((tex) => {
    // Pixels are passed through unchanged (sRGB in, sRGB out).
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  });
}

type Textures = Map<string, THREE.Texture>;

function PhotoPlane({ textures, heroId }: { textures: Textures; heroId: string }) {
  const { size, invalidate } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTexA: { value: null },
          uTexB: { value: null },
          uAspA: { value: 1 },
          uAspB: { value: 1 },
          uView: { value: 1 },
          uFrameA: { value: new THREE.Vector3(1, 0.5, 0.5) },
          uFrameB: { value: new THREE.Vector3(1, 0.5, 0.5) },
          uMix: { value: 0 },
        },
      }),
    [],
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  const mesh = useRef<THREE.Mesh>(null);
  const motion = useRef<{ cur: number | null; jump: { from: Layer; t: number } | null }>({ cur: null, jump: null });
  useEffect(() => subscribeJourney(() => invalidate()), [invalidate]);
  useEffect(() => invalidate(), [textures, invalidate]);

  useFrame((_, rawDelta) => {
    const mat = mesh.current?.material as THREE.ShaderMaterial | undefined;
    if (!mat) return;
    const delta = Math.min(rawDelta, 0.1);
    const m = motion.current;
    const target = getJourney().raw;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (m.cur === null || reduced) m.cur = target;
    else if (Math.abs(target - m.cur) > JUMP && !m.jump) {
      // Anchor jump: dissolve straight from what is on screen to the target.
      m.jump = { from: layersAt(m.cur).a, t: 0 };
      m.cur = target;
    } else {
      m.cur += (target - m.cur) * (1 - Math.exp(-6 * delta));
      if (Math.abs(target - m.cur) < 1e-4) m.cur = target;
    }

    let { a, b, mix } = layersAt(m.cur);
    if (m.jump) {
      m.jump.t = Math.min(m.jump.t + delta / 0.8, 1);
      b = a;
      a = { visual: m.jump.from.visual, frame: { ...m.jump.from.frame, zoom: m.jump.from.frame.zoom * (1 + 0.05 * m.jump.t) } };
      mix = smooth(0, 1, m.jump.t);
      if (m.jump.t >= 1) m.jump = null;
    }

    const tall = size.width / size.height < 1.2 && window.innerWidth / window.innerHeight < TALL_VIEWPORT;
    const fallback = textures.get(heroId);
    const apply = (layer: Layer, tex: "uTexA" | "uTexB", asp: "uAspA" | "uAspB", fr: "uFrameA" | "uFrameB") => {
      const texture = textures.get(layer.visual.id) ?? fallback ?? null;
      const focal = tall ? layer.visual.focal.tall : layer.visual.focal.wide;
      const fx = Math.min(Math.max(focal.x + layer.frame.dx, 0), 1);
      const fy = Math.min(Math.max(focal.y + layer.frame.dy, 0), 1);
      const u = mat.uniforms;
      u[tex].value = texture;
      u[asp].value = layer.visual.width / layer.visual.height;
      (u[fr].value as THREE.Vector3).set(Math.max(layer.frame.zoom, 1), fx, 1 - fy);
    };
    apply(a, "uTexA", "uAspA", "uFrameA");
    if (b) apply(b, "uTexB", "uAspB", "uFrameB");
    mat.uniforms.uMix.value = b ? mix : 0;
    mat.uniforms.uView.value = size.width / size.height;
    if (m.jump || m.cur !== target) invalidate();
  });

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />;
}

export type PhotoSceneProps = {
  /** The server-rendered hero <img>; its loaded file is reused as the first texture. */
  heroImage: HTMLImageElement | null;
  onReady: () => void;
};

export default function PhotoScene({ heroImage, onReady }: PhotoSceneProps) {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 1.75];
  const heroId = beats[0].visual;
  const [textures, setTextures] = useState<Textures>(() => new Map());
  const [frameloop, setFrameloop] = useState<"never" | "demand">("never");
  const wrap = useRef<HTMLDivElement>(null);

  // Hero first (reusing the exact file the <img> already downloaded), then
  // the rest one by one in the background.
  useEffect(() => {
    let cancelled = false;
    const loaded: THREE.Texture[] = [];
    const add = (id: string, tex: THREE.Texture) => {
      if (cancelled) return tex.dispose();
      loaded.push(tex);
      setTextures((prev) => new Map(prev).set(id, tex));
    };
    const hero = visualById(heroId);
    const format = heroImage?.currentSrc.endsWith(".avif") ? "avif" : "webp";
    const heroUrl = heroImage?.currentSrc || srcFor(hero, pickWidth(hero), "webp");

    (async () => {
      add(heroId, await loadTexture(heroUrl));
      setLoadMilestone(0.8);
      for (const v of visuals) {
        if (cancelled) return;
        if (v.id === heroId) continue;
        try {
          add(v.id, await loadTexture(srcFor(v, pickWidth(v), format)));
        } catch {
          // A missing image keeps showing the hero rather than breaking the scene.
        }
      }
    })().catch(() => undefined);

    return () => {
      cancelled = true;
      loaded.forEach((t) => t.dispose());
    };
  }, [heroId, heroImage]);

  // Render only while the stage is on screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !textures.has(heroId)) return;
    const io = new IntersectionObserver(([entry]) => setFrameloop(entry.isIntersecting ? "demand" : "never"));
    io.observe(el);
    return () => io.disconnect();
  }, [textures, heroId]);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={({ gl, scene, camera }) => {
          setLoadMilestone(0.6);
          gl.setClearColor(0x17140f, 1);
          // Compile off the main thread where supported, before the first frame.
          gl.compileAsync(scene, camera).catch(() => undefined);
        }}
        tabIndex={-1}
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        {textures.has(heroId) && <PhotoPlane textures={textures} heroId={heroId} />}
        {textures.has(heroId) && <ReadySignal onReady={onReady} />}
      </Canvas>
    </div>
  );
}

/** Calls onReady after the first frame with the hero texture has rendered. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    setLoadMilestone(1);
    requestAnimationFrame(() => onReady());
  });
  return null;
}
