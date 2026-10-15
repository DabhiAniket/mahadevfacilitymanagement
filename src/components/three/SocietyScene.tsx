"use client";

// A stylised residential society built from primitives: two towers with
// balconies, a walk-in lobby, a furnished apartment, a gate, a garden, a pool
// and rooftop water tanks. The camera opens high above the clouds, descends
// to the hero shot, then follows one continuous path through a shot per
// service (see SHOTS). No external models or textures are loaded;
// docs/animation-plan.md lists where real models can replace these parts.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Instance, Instances } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  getJourney,
  JOURNEY_STEPS,
  setIntroStage,
  setLoadMilestone,
  subscribeJourney,
} from "@/lib/journey";

type Vec3 = [number, number, number];
type Shot = {
  pos: Vec3;
  target: Vec3;
  /** Control point for the segment arriving at this shot (curved path). */
  via?: { pos: Vec3; target: Vec3 };
};

const SHOTS: Record<(typeof JOURNEY_STEPS)[number], Shot> = {
  // Eye level through foreground trees, looking up at the towers.
  hero: { pos: [44, 7, 58], target: [-1, 12, -4] },
  // Aerial three-quarter view of the whole society.
  "society-management": {
    pos: [38, 50, 40],
    target: [0, 4, -1],
    via: { pos: [52, 26, 56], target: [-1, 9, -2] },
  },
  // Inside the lobby, entered through the glass front.
  housekeeping: {
    pos: [-3, 1.6, -0.7],
    target: [-7, 1.1, -4.2],
    via: { pos: [-4.5, 3.2, 9], target: [-5.5, 1.6, -2] },
  },
  "garden-maintenance": { pos: [-20, 10, 20], target: [-7.5, 0.5, 8] },
  "swimming-pool-maintenance": { pos: [16, 8, 17], target: [7.5, 0, 7] },
  "water-tank-cleaning": { pos: [17, 31, 6], target: [6, 25.2, -6] },
  // Inside the apartment, entered through the lit window.
  "residential-deep-cleaning": {
    pos: [-3.25, 19.55, -0.8],
    target: [-4.2, 18.7, -4.4],
    via: { pos: [-3.33, 19.6, 7], target: [-3.6, 19.3, -2] },
  },
};
const SHOT_LIST = JOURNEY_STEPS.map((s) => SHOTS[s]);

const INTRO = {
  start: { pos: [4, 150, 30] as Vec3, target: [0, 0, 0] as Vec3 },
  via: [40, 62, 62] as Vec3,
  holdSeconds: 0.9,
  descentSeconds: 3,
};

const COLORS = {
  horizon: "#e9e3d8",
  skyTop: "#a9b9c6",
  ground: "#c9bfac",
  paving: "#beb39f",
  road: "#7d776d",
  wall: "#ddd4c5",
  band: "#b3a58e",
  gold: "#c8a060",
  glass: "#4a5b66",
  rail: "#9fb3bf",
  lobby: "#e6d6b8",
  litGlass: "#f5c77e",
  lawn: "#728c58",
  hedge: "#56703f",
  canopy: "#5f7d47",
  trunk: "#6b5845",
  water: "#4f8fa3",
  deck: "#e4dccd",
  tank: "#2f3a42",
  interior: "#efe8dc",
  wood: "#8a6a4c",
  sofa: "#e6dfd2",
  rug: "#cdbb98",
  slate: "#2a4658",
  cloud: "#fffaf2",
};

const FLOOR_H = 3;

type Materials = ReturnType<typeof createMaterials>;

// Lambert shading keeps shader programs small and quick to compile; the
// stylised, evenly lit look does not need physically based materials.
function createMaterials() {
  const mat = (color: string, extra: THREE.MeshLambertMaterialParameters = {}) =>
    new THREE.MeshLambertMaterial({ color, ...extra });
  const clear = (color: string, opacity: number, extra: THREE.MeshLambertMaterialParameters = {}) =>
    mat(color, { transparent: true, opacity, depthWrite: false, ...extra });
  return {
    ground: mat(COLORS.ground),
    paving: mat(COLORS.paving),
    road: mat(COLORS.road),
    wall: mat(COLORS.wall),
    band: mat(COLORS.band),
    gold: mat(COLORS.gold),
    glass: mat(COLORS.glass),
    rail: clear(COLORS.rail, 0.35),
    lobbyGlass: clear(COLORS.glass, 0.22),
    litGlass: clear(COLORS.litGlass, 0.3, { emissive: COLORS.litGlass, emissiveIntensity: 0.5 }),
    lobby: mat(COLORS.lobby, { emissive: COLORS.lobby, emissiveIntensity: 0.12 }),
    lamp: mat(COLORS.litGlass, { emissive: COLORS.litGlass, emissiveIntensity: 1 }),
    lawn: mat(COLORS.lawn),
    hedge: mat(COLORS.hedge),
    canopy: mat(COLORS.canopy, { flatShading: true }),
    trunk: mat(COLORS.trunk),
    water: mat(COLORS.water),
    deck: mat(COLORS.deck),
    tank: mat(COLORS.tank),
    interior: mat(COLORS.interior),
    wood: mat(COLORS.wood),
    sofa: mat(COLORS.sofa),
    rug: mat(COLORS.rug),
    slate: mat(COLORS.slate),
  };
}

type TowerSpec = {
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  lobby?: boolean;
  /** [floor, column] of the front window that opens into the apartment. */
  lit?: [number, number];
};

const TOWER_A: TowerSpec = { x: -6, z: -4, width: 8, depth: 8, floors: 10, lobby: true, lit: [6, 2] };
const TOWER_B: TowerSpec = { x: 6, z: -6, width: 7, depth: 7, floors: 8 };

type WindowSlot = { position: Vec3; rotationY: number; lit: boolean };

function towerWindows(t: TowerSpec): WindowSlot[] {
  const slots: WindowSlot[] = [];
  const faces = [
    { nx: 0, nz: 1, span: t.width, rot: 0 },
    { nx: 1, nz: 0, span: t.depth, rot: Math.PI / 2 },
    { nx: 0, nz: -1, span: t.width, rot: 0 },
    { nx: -1, nz: 0, span: t.depth, rot: Math.PI / 2 },
  ];
  faces.forEach((f, faceIndex) => {
    for (let floor = 1; floor < t.floors; floor++) {
      for (let col = 0; col < 3; col++) {
        const offset = (col - 1) * (f.span / 3);
        const x = t.x + f.nx * (t.width / 2 + 0.04) + (f.nz !== 0 ? offset : 0);
        const z = t.z + f.nz * (t.depth / 2 + 0.04) + (f.nx !== 0 ? offset : 0);
        const lit = faceIndex === 0 && !!t.lit && t.lit[0] === floor && t.lit[1] === col;
        slots.push({ position: [x, floor * FLOOR_H + 1.6, z], rotationY: f.rot, lit });
      }
    }
  });
  return slots;
}

function Tower({ spec, m }: { spec: TowerSpec; m: Materials }) {
  const height = spec.floors * FLOOR_H;
  const slots = useMemo(() => towerWindows(spec), [spec]);
  const glass = slots.filter((s) => !s.lit);
  const lit = slots.filter((s) => s.lit);
  const bodyBase = spec.lobby ? FLOOR_H : 0;
  const front = spec.z + spec.depth / 2;
  const side = spec.x + spec.width / 2;
  const floors = Array.from({ length: spec.floors - 1 }, (_, i) => (i + 1) * FLOOR_H);
  const BALCONY = 1.3;

  return (
    <group>
      <mesh material={m.wall} position={[spec.x, bodyBase + (height - bodyBase) / 2, spec.z]}>
        <boxGeometry args={[spec.width, height - bodyBase, spec.depth]} />
      </mesh>

      <Instances limit={floors.length} material={m.band}>
        <boxGeometry args={[spec.width + 0.3, 0.18, spec.depth + 0.3]} />
        {floors.map((y) => (
          <Instance key={y} position={[spec.x, y, spec.z]} />
        ))}
      </Instances>

      {/* Balcony slabs and glass railings on the front and street-side faces */}
      <Instances limit={floors.length * 2} material={m.deck}>
        <boxGeometry args={[1, 0.16, 1]} />
        {floors.map((y) => (
          <group key={y}>
            <Instance position={[spec.x, y, front + BALCONY / 2]} scale={[spec.width + 0.3, 1, BALCONY]} />
            <Instance position={[side + BALCONY / 2, y, spec.z]} scale={[BALCONY, 1, spec.depth + 0.3]} />
          </group>
        ))}
      </Instances>
      <Instances limit={floors.length * 2} material={m.rail}>
        <boxGeometry args={[1, 1, 1]} />
        {floors.map((y) => (
          <group key={y}>
            <Instance position={[spec.x, y + 0.6, front + BALCONY - 0.04]} scale={[spec.width + 0.3, 1, 0.04]} />
            <Instance position={[side + BALCONY - 0.04, y + 0.6, spec.z]} scale={[0.04, 1, spec.depth + 0.3]} />
          </group>
        ))}
      </Instances>

      <Instances limit={glass.length} material={m.glass}>
        <boxGeometry args={[1.4, 1.7, 0.08]} />
        {glass.map((s, i) => (
          <Instance key={i} position={s.position} rotation={[0, s.rotationY, 0]} />
        ))}
      </Instances>

      {lit.map((s, i) => (
        <mesh key={i} material={m.litGlass} position={s.position} rotation={[0, s.rotationY, 0]}>
          <boxGeometry args={[1.4, 1.7, 0.02]} />
        </mesh>
      ))}

      <mesh material={m.gold} position={[spec.x, height + 0.12, spec.z]}>
        <boxGeometry args={[spec.width + 0.3, 0.25, spec.depth + 0.3]} />
      </mesh>

      {spec.lobby && <Lobby spec={spec} m={m} />}
    </group>
  );
}

/** Entrance lobby on tower A's ground floor, deep enough to walk into. */
function Lobby({ spec, m }: { spec: TowerSpec; m: Materials }) {
  const front = spec.z + spec.depth / 2;
  const back = spec.z - spec.depth / 2;
  const coreDepth = 3;
  return (
    <group>
      {/* Lit back wall (service core) */}
      <mesh material={m.lobby} position={[spec.x, FLOOR_H / 2, back + coreDepth / 2]}>
        <boxGeometry args={[spec.width - 0.8, FLOOR_H, coreDepth]} />
      </mesh>
      <mesh material={m.deck} position={[spec.x, 0.03, (front + back + coreDepth) / 2]}>
        <boxGeometry args={[spec.width - 0.8, 0.06, spec.depth - coreDepth]} />
      </mesh>
      {/* Reception desk */}
      <mesh material={m.wood} position={[spec.x + 1.5, 0.55, back + coreDepth + 1.2]}>
        <boxGeometry args={[2.4, 1.1, 0.7]} />
      </mesh>
      <mesh material={m.gold} position={[spec.x + 1.5, 1.12, back + coreDepth + 1.2]}>
        <boxGeometry args={[2.5, 0.05, 0.8]} />
      </mesh>
      {/* Ceiling light strip */}
      <mesh material={m.lamp} position={[spec.x, FLOOR_H - 0.06, front - 2.5]}>
        <boxGeometry args={[5, 0.05, 0.3]} />
      </mesh>
      {/* Planters */}
      {[-1, 1].map((s) => (
        <group key={s} position={[spec.x + s * 2.9, 0, front - 0.9]}>
          <mesh material={m.band} position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.32, 0.26, 0.7, 12]} />
          </mesh>
          <mesh material={m.canopy} position={[0, 1.1, 0]}>
            <icosahedronGeometry args={[0.5, 0]} />
          </mesh>
        </group>
      ))}
      {/* Glass front */}
      <mesh material={m.lobbyGlass} position={[spec.x, FLOOR_H / 2, front]}>
        <boxGeometry args={[spec.width - 0.6, FLOOR_H - 0.2, 0.05]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.wall} position={[spec.x + s * (spec.width / 2 - 0.2), FLOOR_H / 2, spec.z]}>
          <boxGeometry args={[0.4, FLOOR_H, spec.depth]} />
        </mesh>
      ))}
      {/* Entrance canopy */}
      <mesh material={m.wall} position={[spec.x, FLOOR_H + 0.3, front + 1.2]}>
        <boxGeometry args={[4.4, 0.2, 2.4]} />
      </mesh>
      <mesh material={m.gold} position={[spec.x, FLOOR_H + 0.3, front + 2.42]}>
        <boxGeometry args={[4.4, 0.22, 0.05]} />
      </mesh>
    </group>
  );
}

/** Furnished apartment behind tower A's lit window. Surfaces face inward. */
function Apartment({ m }: { m: Materials }) {
  const [floor, col] = TOWER_A.lit!;
  const y0 = floor * FLOOR_H + 0.1;
  const y1 = (floor + 1) * FLOOR_H - 0.1;
  const x0 = TOWER_A.x - 0.25; // left wall
  const x1 = TOWER_A.x + TOWER_A.width / 2 - 0.3; // right wall, inside the side face
  const z0 = TOWER_A.z - 1; // back wall
  const z1 = TOWER_A.z + TOWER_A.depth / 2; // window wall
  const w = x1 - x0;
  const d = z1 - z0;
  const h = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const windowX = TOWER_A.x + (col - 1) * (TOWER_A.width / 3);

  return (
    <group>
      <mesh material={m.wood} rotation={[-Math.PI / 2, 0, 0]} position={[cx, y0, cz]}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh material={m.interior} rotation={[Math.PI / 2, 0, 0]} position={[cx, y1, cz]}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh material={m.interior} position={[cx, y0 + h / 2, z0]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={m.interior} rotation={[0, Math.PI / 2, 0]} position={[x0, y0 + h / 2, cz]}>
        <planeGeometry args={[d, h]} />
      </mesh>
      <mesh material={m.interior} rotation={[0, -Math.PI / 2, 0]} position={[x1, y0 + h / 2, cz]}>
        <planeGeometry args={[d, h]} />
      </mesh>

      <mesh material={m.rug} rotation={[-Math.PI / 2, 0, 0]} position={[windowX - 0.4, y0 + 0.01, z0 + 1.9]}>
        <planeGeometry args={[2.6, 1.8]} />
      </mesh>
      {/* Sofa */}
      <group position={[windowX - 0.6, y0, z0 + 0.75]}>
        <mesh material={m.sofa} position={[0, 0.25, 0.1]}>
          <boxGeometry args={[2.3, 0.5, 0.9]} />
        </mesh>
        <mesh material={m.sofa} position={[0, 0.65, -0.25]}>
          <boxGeometry args={[2.3, 0.6, 0.25]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.sofa} position={[s * 1.1, 0.45, 0.1]}>
            <boxGeometry args={[0.2, 0.5, 0.9]} />
          </mesh>
        ))}
      </group>
      {/* Coffee table */}
      <mesh material={m.wood} position={[windowX - 0.5, y0 + 0.22, z0 + 2.1]}>
        <boxGeometry args={[1, 0.44, 0.6]} />
      </mesh>
      {/* Floor lamp */}
      <group position={[x0 + 0.45, y0, z0 + 0.5]}>
        <mesh material={m.tank} position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
        </mesh>
        <mesh material={m.lamp} position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.18, 0.25, 0.3, 12]} />
        </mesh>
      </group>
      {/* Plant */}
      <group position={[x1 - 0.5, y0, z0 + 0.5]}>
        <mesh material={m.band} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.5, 10]} />
        </mesh>
        <mesh material={m.canopy} position={[0, 0.9, 0]}>
          <icosahedronGeometry args={[0.45, 0]} />
        </mesh>
      </group>
      {/* Framed panel on the back wall */}
      <mesh material={m.gold} position={[windowX - 0.6, y0 + 1.65, z0 + 0.02]}>
        <boxGeometry args={[1.3, 0.85, 0.03]} />
      </mesh>
      <mesh material={m.slate} position={[windowX - 0.6, y0 + 1.65, z0 + 0.04]}>
        <boxGeometry args={[1.18, 0.73, 0.02]} />
      </mesh>
    </group>
  );
}

const WALL = { minX: -15, maxX: 15, minZ: -14, maxZ: 14, h: 1.6, t: 0.3, gate: 2.5 };

function BoundaryAndGate({ m }: { m: Materials }) {
  const { minX, maxX, minZ, maxZ, h, t, gate } = WALL;
  const segments: { pos: Vec3; size: Vec3 }[] = [
    { pos: [0, h / 2, minZ], size: [maxX - minX, h, t] },
    { pos: [minX, h / 2, 0], size: [t, h, maxZ - minZ] },
    { pos: [maxX, h / 2, 0], size: [t, h, maxZ - minZ] },
    { pos: [(minX - gate) / 2, h / 2, maxZ], size: [-gate - minX, h, t] },
    { pos: [(maxX + gate) / 2, h / 2, maxZ], size: [maxX - gate, h, t] },
  ];
  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} material={m.wall} position={s.pos}>
          <boxGeometry args={s.size} />
        </mesh>
      ))}
      {[-gate, gate].map((x) => (
        <group key={x}>
          <mesh material={m.wall} position={[x, 1.2, maxZ]}>
            <boxGeometry args={[0.6, 2.4, 0.6]} />
          </mesh>
          <mesh material={m.gold} position={[x, 2.48, maxZ]}>
            <boxGeometry args={[0.7, 0.16, 0.7]} />
          </mesh>
        </group>
      ))}
      <mesh material={m.band} position={[-gate - 1.4, 0.8, maxZ + 0.3]}>
        <boxGeometry args={[2.6, 1.3, 0.08]} />
      </mesh>
      {/* Security cabin */}
      <group position={[4.5, 0, 12.4]}>
        <mesh material={m.wall} position={[0, 1.2, 0]}>
          <boxGeometry args={[2.2, 2.4, 2]} />
        </mesh>
        <mesh material={m.glass} position={[0, 1.5, 1.01]}>
          <boxGeometry args={[1.6, 0.8, 0.04]} />
        </mesh>
        <mesh material={m.wall} position={[0, 2.5, 0.1]}>
          <boxGeometry args={[2.8, 0.18, 2.6]} />
        </mesh>
        <mesh material={m.gold} position={[0, 2.5, 1.41]}>
          <boxGeometry args={[2.8, 0.2, 0.04]} />
        </mesh>
      </group>
    </group>
  );
}

// [x, z, scale]. The last three frame the hero shot from the foreground.
const TREES: Vec3[] = [
  [-11.5, 5, 1],
  [-11.8, 11, 1],
  [-8, 11.5, 1],
  [-4, 11.2, 1],
  [-12.5, -11, 1],
  [12.5, -11.5, 1],
  [13, 2, 1],
  [18, 18, 1.2],
  [21, 12, 1.2],
  [-19, 17, 1.2],
  [35.1, 53.4, 2.2],
  [40.6, 43.2, 1.8],
  [22.6, 43.9, 1.6],
];

function Grounds({ m }: { m: Materials }) {
  return (
    <group>
      <mesh material={m.ground} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 900]} />
      </mesh>
      <mesh material={m.paving} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[WALL.maxX - WALL.minX, WALL.maxZ - WALL.minZ]} />
      </mesh>
      {/* Street outside the gate, driveway to the lobby */}
      <mesh material={m.road} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 19]}>
        <planeGeometry args={[160, 7]} />
      </mesh>
      <mesh material={m.road} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 9.25]}>
        <planeGeometry args={[4.4, 10.5]} />
      </mesh>
      <mesh material={m.road} rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, 0.021, 3]}>
        <planeGeometry args={[10.8, 3.4]} />
      </mesh>

      <mesh material={m.lawn} rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.03, 8.4]}>
        <planeGeometry args={[11, 7.6]} />
      </mesh>
      {[
        { pos: [-8, 0.35, 4.75] as Vec3, size: [11, 0.7, 0.5] as Vec3 },
        { pos: [-13.4, 0.35, 8.4] as Vec3, size: [0.5, 0.7, 7.6] as Vec3 },
      ].map((h, i) => (
        <mesh key={i} material={m.hedge} position={h.pos}>
          <boxGeometry args={h.size} />
        </mesh>
      ))}
      <Instances limit={TREES.length} material={m.trunk}>
        <cylinderGeometry args={[0.14, 0.18, 1.6, 6]} />
        {TREES.map(([x, z, s], i) => (
          <Instance key={i} position={[x, 0.8 * s, z]} scale={s} />
        ))}
      </Instances>
      <Instances limit={TREES.length} material={m.canopy}>
        <icosahedronGeometry args={[1.25, 0]} />
        {TREES.map(([x, z, s], i) => (
          <Instance key={i} position={[x, 2.4 * s, z]} scale={[s, 1.15 * s, s]} />
        ))}
      </Instances>

      <group position={[7.5, 0, 7.5]}>
        <mesh material={m.water} position={[0, 0.06, 0]}>
          <boxGeometry args={[7, 0.06, 4]} />
        </mesh>
        {[
          { pos: [0, 0.07, 2.75] as Vec3, size: [10, 0.14, 1.5] as Vec3 },
          { pos: [0, 0.07, -2.75] as Vec3, size: [10, 0.14, 1.5] as Vec3 },
          { pos: [4.25, 0.07, 0] as Vec3, size: [1.5, 0.14, 4] as Vec3 },
          { pos: [-4.25, 0.07, 0] as Vec3, size: [1.5, 0.14, 4] as Vec3 },
        ].map((d, i) => (
          <mesh key={i} material={m.deck} position={d.pos}>
            <boxGeometry args={d.size} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RooftopTanks({ m }: { m: Materials }) {
  const top = TOWER_B.floors * FLOOR_H + 0.25;
  return (
    <group position={[TOWER_B.x, top, TOWER_B.z]}>
      <mesh material={m.band} position={[0, 0.3, 0]}>
        <boxGeometry args={[4, 0.6, 2.2]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.tank} position={[s, 1.35, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 1.5, 20]} />
        </mesh>
      ))}
    </group>
  );
}

const NEIGHBOURS: { pos: Vec3; size: Vec3 }[] = [
  { pos: [-40, 0, -40], size: [10, 26, 10] },
  { pos: [-22, 0, -48], size: [9, 34, 9] },
  { pos: [4, 0, -52], size: [12, 22, 10] },
  { pos: [28, 0, -44], size: [9, 30, 9] },
  { pos: [46, 0, -30], size: [10, 18, 10] },
  { pos: [-52, 0, -10], size: [10, 20, 12] },
  { pos: [52, 0, 4], size: [9, 14, 9] },
  { pos: [-34, 0, 34], size: [12, 12, 10] },
  { pos: [44, 0, 40], size: [10, 16, 12] },
];

function Neighbours({ m }: { m: Materials }) {
  return (
    <Instances limit={NEIGHBOURS.length} material={m.wall}>
      <boxGeometry args={[1, 1, 1]} />
      {NEIGHBOURS.map((b, i) => (
        <Instance key={i} position={[b.pos[0], b.size[1] / 2, b.pos[2]]} scale={b.size} />
      ))}
    </Instances>
  );
}

/** Gradient sky dome; ignores fog so the horizon always matches it. */
function Sky() {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(280, 32, 16);
    const top = new THREE.Color(COLORS.skyTop);
    const horizon = new THREE.Color(COLORS.horizon);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = Math.min(Math.max(pos.getY(i) / 280, 0), 1);
      c.copy(horizon).lerp(top, Math.pow(t, 0.6));
      c.toArray(colors, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return <mesh geometry={geometry} material={material} renderOrder={-1} />;
}

function cloudTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Deterministic blob layout so every visit looks the same.
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14; i++) {
    const x = size * (0.3 + rand() * 0.4);
    const y = size * (0.35 + rand() * 0.3);
    const r = size * (0.12 + rand() * 0.16);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Clustered under the opening view and along the descent path, so the camera
// starts above a cloud layer and flies through it.
const CLOUDS: { pos: Vec3; scale: number }[] = (() => {
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 40 }, (_, i) => {
    const onPath = i % 3 === 0;
    const pos: Vec3 = onPath
      ? [40 + (rand() - 0.5) * 50, 64 + rand() * 30, 62 + (rand() - 0.5) * 50]
      : [(rand() - 0.5) * 110, 62 + rand() * 40, 25 + (rand() - 0.5) * 110];
    return { pos, scale: 26 + rand() * 30 };
  });
})();

/** Cloud layer and location ring, visible during the intro only. */
function IntroLayer() {
  const group = useRef<THREE.Group>(null);
  const { texture, cloud, ring } = useMemo(() => {
    const texture = cloudTexture();
    return {
      texture,
      cloud: new THREE.SpriteMaterial({
        map: texture,
        color: COLORS.cloud,
        transparent: true,
        depthWrite: false,
        opacity: 0.95,
      }),
      ring: new THREE.MeshBasicMaterial({
        color: COLORS.gold,
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    };
  }, []);
  useEffect(
    () => () => {
      texture.dispose();
      cloud.dispose();
      ring.dispose();
    },
    [texture, cloud, ring],
  );

  const fade = useRef(1);
  const firstCloud = useRef<THREE.Sprite>(null);
  const ringMesh = useRef<THREE.Mesh>(null);
  useFrame(({ camera, invalidate }, delta) => {
    const g = group.current;
    if (!g || !g.visible || !firstCloud.current || !ringMesh.current) return;
    if (getJourney().intro === "done") {
      fade.current = Math.max(fade.current - Math.min(delta, 0.1) * 1.5, 0);
      if (fade.current === 0) g.visible = false;
      else invalidate();
    }
    // All sprites share one material.
    firstCloud.current.material.opacity = 0.95 * fade.current;
    // The ring reads only from high up.
    (ringMesh.current.material as THREE.MeshBasicMaterial).opacity =
      Math.min(Math.max((camera.position.y - 50) / 60, 0), 1) * fade.current;
  });

  return (
    <group ref={group}>
      {CLOUDS.map((c, i) => (
        <sprite
          key={i}
          ref={i === 0 ? firstCloud : undefined}
          material={cloud}
          position={c.pos}
          scale={[c.scale, c.scale * 0.6, 1]}
        />
      ))}
      <mesh ref={ringMesh} material={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[21, 21.8, 96]} />
      </mesh>
    </group>
  );
}

function createRigVectors() {
  return {
    pos: new THREE.Vector3(...INTRO.start.pos),
    target: new THREE.Vector3(...INTRO.start.target),
    desiredPos: new THREE.Vector3(),
    desiredTarget: new THREE.Vector3(),
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    c: new THREE.Vector3(),
    d: new THREE.Vector3(),
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function quadratic(out: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, t: number) {
  const u = 1 - t;
  return out
    .copy(a)
    .multiplyScalar(u * u)
    .addScaledVector(c, 2 * u * t)
    .addScaledVector(b, t * t);
}

function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, size, invalidate } = useThree();
  // Scratch vectors, created on the first frame and reused.
  const vectors = useRef<ReturnType<typeof createRigVectors> | null>(null);
  const introClock = useRef<{ stage: string; start: number } | null>(null);
  const placed = useRef(false);

  useEffect(() => subscribeJourney(() => invalidate()), [invalidate]);

  // Keep the focal point clear of the text: right of centre on wide screens,
  // upper part of the frame on portrait screens where text sits low.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const { width: w, height: h } = size;
    if (w / h > 1.1) cam.setViewOffset(w, h, -w * 0.14, 0, w, h);
    else cam.setViewOffset(w, h, 0, h * 0.16, w, h);
    cam.updateProjectionMatrix();
    invalidate();
    return () => {
      cam.clearViewOffset();
    };
  }, [camera, size, invalidate]);

  /** Camera for a continuous journey position, with curved arrivals. */
  const journeyShot = (
    v: ReturnType<typeof createRigVectors>,
    position: number,
    outPos: THREE.Vector3,
    outTarget: THREE.Vector3,
  ) => {
    const i = Math.min(Math.floor(position), SHOT_LIST.length - 2);
    const t = Math.min(Math.max(position - i, 0), 1);
    const from = SHOT_LIST[i];
    const to = SHOT_LIST[i + 1];
    v.a.set(...from.pos);
    v.b.set(...to.pos);
    if (to.via) {
      quadratic(outPos, v.a, v.c.set(...to.via.pos), v.b, t);
      v.a.set(...from.target);
      v.b.set(...to.target);
      quadratic(outTarget, v.a, v.c.set(...to.via.target), v.b, t);
    } else {
      outPos.copy(v.a).lerp(v.b, t);
      outTarget.set(...from.target).lerp(v.d.set(...to.target), t);
    }
  };

  useFrame((state, rawDelta) => {
    // Clamp long gaps (the demand frameloop idles between scrolls) without
    // slowing the damping on devices that render at low frame rates.
    const delta = Math.min(rawDelta, 0.1);
    const { camera, scene } = state;
    const v = (vectors.current ??= createRigVectors());
    const j = getJourney();
    journeyShot(v, j.position, v.desiredPos, v.desiredTarget);

    let animating = false;
    if (j.intro !== "done") {
      const now = state.clock.elapsedTime;
      if (!introClock.current || introClock.current.stage !== j.intro) {
        introClock.current = { stage: j.intro, start: now };
      }
      const elapsed = now - introClock.current.start;
      if (j.intro === "aerial") {
        if (elapsed >= INTRO.holdSeconds) setIntroStage("descending");
        v.desiredPos.set(...INTRO.start.pos);
        v.desiredTarget.set(...INTRO.start.target);
        v.desiredPos.y -= Math.min(elapsed, INTRO.holdSeconds) * 3; // slow drift while the label shows
      } else if (j.intro === "descending") {
        const t = easeInOutCubic(Math.min(elapsed / INTRO.descentSeconds, 1));
        v.a.set(...INTRO.start.pos);
        v.a.y -= INTRO.holdSeconds * 3;
        quadratic(v.b, v.a, v.c.set(...INTRO.via), v.desiredPos, t);
        v.desiredPos.copy(v.b);
        v.desiredTarget.lerpVectors(v.d.set(...INTRO.start.target), v.desiredTarget, smooth(t));
        if (t >= 1) setIntroStage("done");
      } else {
        v.desiredPos.set(...INTRO.start.pos);
        v.desiredTarget.set(...INTRO.start.target);
      }
      // The intro path is already eased; follow it exactly.
      v.pos.copy(v.desiredPos);
      v.target.copy(v.desiredTarget);
      animating = true;
    } else {
      // Portrait screens need more distance to fit the same framing, except
      // inside the lobby and apartment where pulling back would exit the room.
      const aspect = size.width / size.height;
      const inside = v.desiredPos.y < 22 && v.desiredPos.z < 0.5 && v.desiredPos.x < -1;
      const fit = aspect < 1 && !inside ? 1 + (1 - aspect) * 0.85 : 1;
      v.desiredPos.sub(v.desiredTarget).multiplyScalar(fit).add(v.desiredTarget);

      if (reduced || !placed.current) {
        v.pos.copy(v.desiredPos);
        v.target.copy(v.desiredTarget);
      } else {
        const k = 1 - Math.exp(-5 * delta);
        v.pos.lerp(v.desiredPos, k);
        v.target.lerp(v.desiredTarget, k);
      }
      animating =
        v.pos.distanceToSquared(v.desiredPos) > 1e-5 ||
        v.target.distanceToSquared(v.desiredTarget) > 1e-5;
    }
    placed.current = true;

    camera.position.copy(v.pos);
    camera.lookAt(v.target);

    // Fog thins with altitude so the aerial view still reads.
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 50 + v.pos.y * 0.5;
      scene.fog.far = 170 + v.pos.y * 1.4;
    }

    if (animating) invalidate();
  });

  return null;
}

function SceneContents({ lite, reduced }: { lite: boolean; reduced: boolean }) {
  const m = useMemo(() => createMaterials(), []);
  useEffect(() => () => Object.values(m).forEach((mat) => mat.dispose()), [m]);
  // Decided once at mount: the cloud layer is only built when the intro plays.
  const [withIntro] = useState(() => getJourney().intro !== "done");

  return (
    <>
      <color attach="background" args={[COLORS.horizon]} />
      <fog attach="fog" args={[COLORS.horizon, 55, 170]} />
      <hemisphereLight args={["#e6ecef", "#8a7c66", 1.5]} />
      <directionalLight position={[40, 35, 25]} intensity={2.3} color="#fff0d8" />
      <directionalLight position={[-30, 20, -10]} intensity={0.4} color="#d8e2ea" />

      <Sky />
      <Grounds m={m} />
      <BoundaryAndGate m={m} />
      <Tower spec={TOWER_A} m={m} />
      <Tower spec={TOWER_B} m={m} />
      <Apartment m={m} />
      <RooftopTanks m={m} />
      {!lite && <Neighbours m={m} />}
      {withIntro && <IntroLayer />}
      {!lite && (
        <ContactShadows
          frames={1}
          position={[0, 0.04, 0]}
          scale={70}
          resolution={512}
          far={32}
          blur={2.4}
          opacity={0.32}
          color="#3a3126"
        />
      )}

      <CameraRig reduced={reduced} />
    </>
  );
}

export type SocietySceneProps = {
  lite: boolean;
  reduced: boolean;
  onReady: () => void;
};

export default function SocietyScene({ lite, reduced, onReady }: SocietySceneProps) {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const dpr: [number, number] = lite ? [1, 1] : isMobile ? [1, 1.5] : [1, 1.75];
  // Nothing renders until shaders are compiled, off the main thread where the
  // browser supports KHR_parallel_shader_compile.
  const [frameloop, setFrameloop] = useState<"never" | "demand">("never");

  useEffect(() => setLoadMilestone(0.6), []);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={dpr}
      camera={{ fov: 35, near: 0.3, far: 600, position: INTRO.start.pos }}
      gl={{ antialias: !lite, powerPreference: "high-performance" }}
      onCreated={({ gl, scene, camera }) => {
        setLoadMilestone(0.8);
        // Brighter daylight exposure; ACES tone mapping keeps highlights soft.
        gl.toneMappingExposure = 1.35;
        gl.compileAsync(scene, camera)
          .catch(() => undefined)
          .then(() => {
            setLoadMilestone(1);
            setFrameloop("demand");
            setIntroStage("aerial");
            onReady();
          });
      }}
      tabIndex={-1}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <SceneContents lite={lite} reduced={reduced} />
    </Canvas>
  );
}
