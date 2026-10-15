// Runs before every build (npm "prebuild"). Prints a LAUNCH BLOCKER warning
// while any journey image lacks written permission. It does not fail the
// build, so local previews keep working; it must be clear before launch.
import { SOURCE_PAGE, visuals } from "../src/data/visuals.ts";

const pending = visuals.filter((v) => v.permissionStatus !== "granted");
if (pending.length) {
  const line = "=".repeat(72);
  console.warn(`\n${line}\n  LAUNCH BLOCKER: ${pending.length} of ${visuals.length} journey images have no usage permission.\n${line}`);
  for (const v of pending) console.warn(`  - ${v.id.padEnd(16)} ${v.sourceUrl}  (permission: ${v.permissionStatus})`);
  console.warn(`  Source page: ${SOURCE_PAGE}`);
  console.warn(`\n  Do not deploy until permission is confirmed in writing and recorded in`);
  console.warn(`  src/data/visuals.ts and docs/assets.md.\n${line}\n`);
} else {
  console.log("Journey images: permission granted for all images.");
}
