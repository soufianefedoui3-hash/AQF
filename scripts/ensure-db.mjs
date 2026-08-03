import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runEnsureAdmin } from "./ensure-admin.mjs";
import {
  applySqlSchemaFallback,
  runPrismaCli,
} from "./prisma-cli.mjs";

const DEFAULT_RELATIVE_DB = "file:./dev.db";

function log(message) {
  console.log(`[ensure-db] ${message}`);
}

function warn(message) {
  console.warn(`[ensure-db] ${message}`);
}

function error(message) {
  console.error(`[ensure-db] ${message}`);
}

/**
 * Resolve a writable SQLite path for production hosts where relative paths
 * or missing directories cause prisma db push to fail on boot.
 */
export function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  // Development: keep configured path (typically file:./dev.db), just absolutize.
  if (!isProduction) {
    if (configured?.startsWith("file:")) {
      const rawPath = configured.replace(/^file:/, "");
      const absolutePath = rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath)
        ? rawPath
        : resolve(process.cwd(), rawPath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      const absoluteUrl = `file:${absolutePath.replace(/\\/g, "/")}`;
      process.env.DATABASE_URL = absoluteUrl;
      return absoluteUrl;
    }

    const dbPath = join(process.cwd(), "prisma", "dev.db");
    mkdirSync(dirname(dbPath), { recursive: true });
    const absoluteUrl = `file:${dbPath.replace(/\\/g, "/")}`;
    process.env.DATABASE_URL = absoluteUrl;
    return absoluteUrl;
  }

  const useProductionDefault =
    !configured ||
    configured === DEFAULT_RELATIVE_DB ||
    configured === "file:./prisma/dev.db" ||
    configured === "file:./dev.db";

  if (useProductionDefault) {
    const dbPath = join(process.cwd(), "prisma", "production.db");
    mkdirSync(dirname(dbPath), { recursive: true });
    const absoluteUrl = `file:${dbPath.replace(/\\/g, "/")}`;
    process.env.DATABASE_URL = absoluteUrl;
    return absoluteUrl;
  }

  if (configured.startsWith("file:")) {
    const rawPath = configured.replace(/^file:/, "");
    const absolutePath = rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath)
      ? rawPath
      : resolve(process.cwd(), rawPath);

    mkdirSync(dirname(absolutePath), { recursive: true });
    process.env.DATABASE_URL = `file:${absolutePath.replace(/\\/g, "/")}`;
    return process.env.DATABASE_URL;
  }

  const dbPath = join(process.cwd(), "prisma", "production.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  const absoluteUrl = `file:${dbPath.replace(/\\/g, "/")}`;
  process.env.DATABASE_URL = absoluteUrl;
  return absoluteUrl;
}

export async function runSchemaPush({ acceptDataLoss = false } = {}) {
  const args = ["db", "push", "--skip-generate"];
  if (acceptDataLoss) {
    args.push("--accept-data-loss");
  }

  const cliResult = runPrismaCli(args);
  if (cliResult.ok) {
    return { ok: true, method: "cli", path: cliResult.path };
  }

  warn(`Prisma CLI push failed (${cliResult.error}). Trying SQL fallback...`);

  const databaseUrl = resolveDatabaseUrl();
  await applySqlSchemaFallback(databaseUrl);
  return { ok: true, method: "sql-fallback" };
}

/**
 * Best-effort database bootstrap. Never throws — callers decide whether to abort boot.
 */
export async function bootstrapDatabase() {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    warn("SKIP_DB_BOOTSTRAP=true — skipping database bootstrap.");
    return { ok: true, skipped: true };
  }

  log("Starting database bootstrap...");

  try {
    const databaseUrl = resolveDatabaseUrl();
    log(`Using database: ${databaseUrl}`);

    log("Ensuring SQLite schema...");
    const pushResult = await runSchemaPush({ acceptDataLoss: true });
    log(`Schema ready via ${pushResult.method}.`);

    const forceReset = process.env.ADMIN_FORCE_RESET === "true";
    const result = await runEnsureAdmin({ forceReset });

    log(`${result.message}: ${result.email}`);
    if (result.created) {
      log("Default credentials apply from ADMIN_EMAIL / ADMIN_PASSWORD.");
    }
    if (result.repaired) {
      log("Admin password hash was repaired to match ADMIN_PASSWORD.");
    }
    if (result.verified) {
      log("Admin credentials verified against ADMIN_PASSWORD.");
    }
    if (forceReset) {
      log("Admin password was reset from ADMIN_PASSWORD.");
    }

    return { ok: true, ...result };
  } catch (bootstrapError) {
    error(`Bootstrap failed: ${bootstrapError.message}`);
    error("The web server will still start, but admin login may fail until bootstrap succeeds.");
    return { ok: false, error: bootstrapError.message };
  }
}

async function main() {
  const result = await bootstrapDatabase();
  process.exit(result.ok ? 0 : 1);
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  main();
}
