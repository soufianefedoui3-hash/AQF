/**
 * Hostinger production server.
 * Not standalone. Listens on PORT and serves Next.js, with a CSS
 * fallback so stale CDN HTML that requests old /_next/static/css hashes
 * still receives the current Tailwind bundle instead of a 404.
 */
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { parse } from "node:url";
import next from "next";

const port = Number(process.env.PORT || 3000);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

function fileIfExists(path) {
  try {
    return existsSync(path) && statSync(path).isFile() ? path : null;
  } catch {
    return null;
  }
}

function latestCss() {
  const dirs = [
    join(process.cwd(), ".next", "static", "css"),
    join(process.cwd(), "public", "_next", "static", "css"),
    join(process.cwd(), "public", "styles"),
  ];
  let best = null;
  let bestSize = -1;
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".css")) continue;
      const file = join(dir, name);
      const size = statSync(file).size;
      if (size > bestSize) {
        best = file;
        bestSize = size;
      }
    }
  }
  return best;
}

function resolveCss(urlPath) {
  const clean = urlPath.split("?")[0];
  const name = clean.replace(/^\/_next\/static\/css\//, "");
  if (!name || name.includes("..")) return null;

  const exact =
    fileIfExists(join(process.cwd(), ".next", "static", "css", name)) ||
    fileIfExists(join(process.cwd(), "public", "_next", "static", "css", name));
  if (exact) return { file: exact, exact: true };

  const fallback =
    fileIfExists(join(process.cwd(), "public", "styles", "aqf.css")) ||
    latestCss();
  return fallback ? { file: fallback, exact: false } : null;
}

function sendFile(res, file, exact) {
  res.setHeader("Content-Type", "text/css; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    exact ? "public, max-age=31536000, immutable" : "public, max-age=60"
  );
  res.setHeader("CDN-Cache-Control", exact ? "public, max-age=31536000, immutable" : "no-store");
  createReadStream(file).pipe(res);
}

await app.prepare();

createServer((req, res) => {
  try {
    const url = req.url || "/";
    const pathOnly = url.split("?")[0];
    if (
      req.method === "GET" &&
      pathOnly.startsWith("/_next/static/css/") &&
      extname(pathOnly) === ".css"
    ) {
      const resolved = resolveCss(pathOnly);
      if (resolved) {
        sendFile(res, resolved.file, resolved.exact);
        return;
      }
    }
    handle(req, res, parse(url, true));
  } catch (error) {
    console.error("[server]", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
}).listen(port, hostname, () => {
  console.log(`[server] AQF ready on http://${hostname}:${port}`);
});
