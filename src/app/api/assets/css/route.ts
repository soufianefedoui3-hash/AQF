import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSS_HEADERS = {
  "Content-Type": "text/css; charset=utf-8",
  "Cache-Control": "public, max-age=300, must-revalidate",
};

function readCss(path: string): Buffer | null {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path);
  } catch {
    return null;
  }
}

function largestCssIn(dir: string): Buffer | null {
  if (!existsSync(dir)) return null;
  let best: Buffer | null = null;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".css")) continue;
    const full = join(dir, name);
    const size = statSync(full).size;
    if (!best || size > best.length) {
      best = readFileSync(full);
    }
  }
  return best;
}

/** Serve the current Tailwind bundle when a hashed /_next/static/css file 404s. */
export async function GET() {
  const fromPublic = readCss(join(process.cwd(), "public", "styles", "aqf.css"));
  const fromBuild = largestCssIn(join(process.cwd(), ".next", "static", "css"));
  const body = fromPublic ?? fromBuild;
  if (!body) {
    return new NextResponse("/* aqf css unavailable */\n", {
      status: 404,
      headers: CSS_HEADERS,
    });
  }
  return new NextResponse(new Uint8Array(body), { headers: CSS_HEADERS });
}
