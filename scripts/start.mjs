import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { bootstrapDatabase } from "./ensure-db.mjs";

const port = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "0.0.0.0";

function launchNext() {
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

  if (!existsSync(nextBin)) {
    console.error("[start] Next.js binary not found. Did npm install complete?");
    process.exit(1);
  }

  console.log("[start] Launching Next.js server...");

  const nextProcess = spawn(process.execPath, [nextBin, "start", "-p", port, "-H", hostname], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  nextProcess.on("error", (startError) => {
    console.error("[start] Failed to launch Next.js:", startError.message);
    process.exit(1);
  });

  nextProcess.on("exit", (code, signal) => {
    if (signal) {
      console.error(`[start] Next.js stopped by signal: ${signal}`);
      process.exit(1);
    }

    process.exit(code ?? 0);
  });
}

async function main() {
  console.log("[start] Booting AQF production server...");
  console.log(`[start] Node ${process.version} | PORT=${port} | HOSTNAME=${hostname}`);

  await bootstrapDatabase();
  launchNext();
}

main().catch((error) => {
  console.error("[start] Unexpected startup failure:", error.message);
  process.exit(1);
});
