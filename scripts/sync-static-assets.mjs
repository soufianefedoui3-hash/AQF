/**
 * Next.js refuses to start a build if public/_next exists.
 * Hostinger LiteSpeed still looks for /_next/static on disk at runtime.
 *
 *   node scripts/sync-static-assets.mjs pre   — delete public/_next
 *   node scripts/sync-static-assets.mjs post  — copy .next/static after build
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const destRoot = join(process.cwd(), "public", "_next");
const dest = join(destRoot, "static");
const src = join(process.cwd(), ".next", "static");
const mode = process.argv[2] === "pre" ? "pre" : "post";

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
