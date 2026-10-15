// Converts the originals listed in src/data/visuals.ts into sized AVIF and
// WebP files under public/visuals. Run with `npm run visuals`.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { visuals } from "../src/data/visuals.ts";

const root = new URL("..", import.meta.url).pathname;
let missing = 0;

for (const v of visuals) {
  const src = join(root, v.sourceFile);
  if (!existsSync(src)) {
    console.error(`missing source for "${v.id}": ${v.sourceFile} (see docs/assets.md)`);
    missing++;
    continue;
  }
  for (const w of v.widths) {
    if (w > v.width) throw new Error(`${v.id}: width ${w} is larger than the original (${v.width})`);
    const base = join(root, "public", `${v.file}-${w}`);
    mkdirSync(dirname(base), { recursive: true });
    const img = sharp(src).resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: 58, effort: 6 }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: 80 }).toFile(`${base}.webp`);
    console.log(`${v.id} ${w}w -> ${v.file}-${w}.{avif,webp}`);
  }
}
if (missing) process.exitCode = 1;
