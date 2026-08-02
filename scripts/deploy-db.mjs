import { spawnSync } from "node:child_process";
import { join } from "node:path";

/**
 * Single Hostinger-safe DB bootstrap entrypoint.
 * Always exits 0 so automatic deploy/start never fails.
 */
function log(message) {
  console.log(`[deploy-db] ${message}`);
}

function warn(message) {
  console.warn(`[deploy-db] ${message}`);
}

function runStep(label, scriptName) {
  const scriptPath = join(process.cwd(), "scripts", scriptName);
  log(`Running ${label}...`);

  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  if (result.error) {
    warn(`${label} failed (non-fatal): ${result.error.message}`);
    return false;
  }

  if ((result.status ?? 0) !== 0) {
    warn(`${label} exited with code ${result.status} (non-fatal).`);
    return false;
  }

  log(`${label} completed.`);
  return true;
}

function main() {
  try {
    if (process.env.SKIP_DB_BOOTSTRAP === "true") {
      log("SKIP_DB_BOOTSTRAP=true — skipping deploy DB bootstrap.");
      process.exit(0);
    }

    runStep("schema push", "push-schema.mjs");

    if (process.env.SKIP_DB_SEED === "true") {
      log("SKIP_DB_SEED=true — skipping seed.");
      process.exit(0);
    }

    runStep("database seed", "seed-db.mjs");
    process.exit(0);
  } catch (error) {
    warn(
      `Deploy DB bootstrap failed (non-fatal): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(0);
  }
}

main();
