import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Runs a lifecycle helper and always exits 0 so Hostinger never fails
 * on postbuild/prestart database hooks.
 */
const scriptName = process.argv[2] || "deploy-db.mjs";
const scriptPath = join(process.cwd(), "scripts", scriptName);

function warn(message) {
  console.warn(`[safe-lifecycle] ${message}`);
}

try {
  if (!existsSync(scriptPath)) {
    warn(`Script not found: ${scriptPath} (non-fatal)`);
    process.exit(0);
  }

  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  if (result.error) {
    warn(`${scriptName} failed (non-fatal): ${result.error.message}`);
  } else if ((result.status ?? 0) !== 0) {
    warn(`${scriptName} exited with code ${result.status} (non-fatal)`);
  }
} catch (error) {
  warn(
    `Lifecycle hook failed (non-fatal): ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

process.exit(0);
