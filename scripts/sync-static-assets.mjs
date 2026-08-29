/**
 * Next.js refuses to start a build if public/_next exists.
 * Hostinger LiteSpeed often looks for /_next/static on disk at runtime,
 * and hCDN may keep HTML that still requests old CSS hashes.
 *
 *   node scripts/sync-static-assets.mjs pre   — delete public/_next
 *   node scripts/sync-static-assets.mjs post  — publish hashed + stable CSS
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";

const destRoot = join(process.cwd(), "public", "_next");
const dest = join(destRoot, "static");
const src = join(process.cwd(), ".next", "static");
const stylesDir = join(process.cwd(), "public", "styles");
const stableCss = join(stylesDir, "aqf.css");
const mode = process.argv[2] === "pre" ? "pre" : "post";

/** CSS hashes still referenced by Hostinger-cached HTML on aqf.ma */
const LEGACY_CSS_ALIASES = ["62c9a8ab05d107a9.css"];

rmSync(destRoot, { recursive: true, force: true });

if (mode === "pre") {
  console.log("[static] Removed public/_next so next build can run");
  process.exit(0);
}

if (!existsSync(src)) {
  console.warn("[static] .next/static missing — skipped public copy");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("[static] Copied .next/static → public/_next/static");

const cssDir = join(src, "css");
const latest = latestCssFile(cssDir);
if (!latest) {
  console.warn("[static] No CSS in .next/static/css");
  process.exit(0);
}

const latestPath = join(cssDir, latest);
mkdirSync(stylesDir, { recursive: true });
copyFileSync(latestPath, stableCss);
console.log(`[static] Published stable stylesheet → public/styles/aqf.css (${latest})`);

for (const alias of LEGACY_CSS_ALIASES) {
  if (alias === latest) continue;
  copyFileSync(latestPath, join(cssDir, alias));
  mkdirSync(join(dest, "css"), { recursive: true });
  copyFileSync(latestPath, join(dest, "css", alias));
  console.log(`[static] Aliased stale CSS hash ${alias} → current Tailwind bundle`);
}

writeFileSync(
  join(process.cwd(), ".next", "css-fallback.json"),
  JSON.stringify({ file: latest, generatedAt: new Date().toISOString() })
);

function latestCssFile(dir) {
  if (!existsSync(dir)) return null;
  let best = null;
  let bestSize = -1;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".css")) continue;
    const size = statSync(join(dir, name)).size;
    if (size > bestSize) {
      best = name;
      bestSize = size;
    }
  }
  return best;
}
