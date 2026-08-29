import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Runs a lifecycle helper and always exits 0 so Hostinger never fails
 * on postbuild/prestart database hooks.
 *
 * Never starts or closes an HTTP/net server — DB scripts are process-only.
 * Hostinger process managers sometimes emit ERR_SERVER_NOT_RUNNING when a
 * long prestart delays `next start`; those net errors are ignored here.
 */

function isBenignNetError(error) {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || String(error);
  return (
    code === "ERR_SERVER_NOT_RUNNING" ||
    /Server is not running/i.test(message)
  );
}

function warn(message) {
  console.warn(`[safe-lifecycle] ${message}`);
}

function ignoreBenign(error, label) {
  if (isBenignNetError(error)) {
    warn(`Ignored benign net error during ${label}: ${error.message || error}`);
    return true;
  }
  return false;
}

process.on("uncaughtException", (error) => {
  if (ignoreBenign(error, "uncaughtException")) return;
  warn(
    `uncaughtException (non-fatal): ${
      error instanceof Error ? error.message : String(error)
    }`
  );
});

process.on("unhandledRejection", (reason) => {
  if (ignoreBenign(reason, "unhandledRejection")) return;
  warn(
    `unhandledRejection (non-fatal): ${
      reason instanceof Error ? reason.message : String(reason)
    }`
  );
});

const scriptName = process.argv[2] || "deploy-db.mjs";
const scriptPath = join(process.cwd(), "scripts", scriptName);

try {
  if (!existsSync(scriptPath)) {
    warn(`Script not found: ${scriptPath} (non-fatal)`);
    process.exit(0);
  }

  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      // Hint for child scripts: do not touch ports / HTTP servers.
      AQF_LIFECYCLE_HOOK: scriptName.replace(/\.mjs$/, ""),
    },
    cwd: process.cwd(),
  });

  if (result.error) {
    if (!ignoreBenign(result.error, scriptName)) {
      warn(`${scriptName} failed (non-fatal): ${result.error.message}`);
    }
  } else if ((result.status ?? 0) !== 0) {
    warn(`${scriptName} exited with code ${result.status} (non-fatal)`);
  }
} catch (error) {
  if (!ignoreBenign(error, "lifecycle")) {
    warn(
      `Lifecycle hook failed (non-fatal): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

process.exit(0);
