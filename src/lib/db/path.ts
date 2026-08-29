import { existsSync, mkdirSync } from "fs";
import { dirname, isAbsolute, join, resolve } from "path";

const DATA_DIR = "data";
const DEV_FILE = "dev.sqlite";
const PROD_FILE = "aqf.sqlite";
const LEGACY_DEV = join("prisma", "dev.db");
const LEGACY_PROD = join("prisma", "production.db");

const DEFAULT_DEV_URLS = new Set([
  "file:./dev.db",
  "file:./prisma/dev.db",
  "file:prisma/dev.db",
  "file:dev.db",
]);

function toAbsoluteFile(fileUrlOrPath: string): string {
  const trimmed = fileUrlOrPath.trim();
  const raw = trimmed.startsWith("file:") ? trimmed.slice("file:".length) : trimmed;
  if (isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) {
    return raw;
  }
  return resolve(process.cwd(), raw);
}

function ensureParentDir(filePath: string): void {
  try {
    mkdirSync(dirname(filePath), { recursive: true });
  } catch (error) {
    console.warn(
      "[db] Could not create database directory:",
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * One stable on-disk SQLite file for the whole process.
 * - development → data/dev.sqlite
 * - production  → data/aqf.sqlite
 * Honors DATABASE_PATH or a non-default file: DATABASE_URL.
 * Falls back to the legacy Prisma file if the new file does not exist yet
 * so Hostinger content is not lost during the rebuild.
 */
export function resolveSqlitePath(): string {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const explicitPath = process.env.DATABASE_PATH?.trim();
    const configuredUrl = process.env.DATABASE_URL?.trim();

    if (explicitPath) {
      const absolute = toAbsoluteFile(explicitPath);
      ensureParentDir(absolute);
      return absolute;
    }

    if (
      configuredUrl?.startsWith("file:") &&
      !DEFAULT_DEV_URLS.has(configuredUrl)
    ) {
      const absolute = toAbsoluteFile(configuredUrl);
      ensureParentDir(absolute);
      return absolute;
    }

    const preferred = join(
      process.cwd(),
      DATA_DIR,
      isDev ? DEV_FILE : PROD_FILE
    );
    const legacy = join(process.cwd(), isDev ? LEGACY_DEV : LEGACY_PROD);

    if (!existsSync(preferred) && existsSync(legacy)) {
      ensureParentDir(preferred);
      return legacy;
    }

    ensureParentDir(preferred);
    return preferred;
  } catch (error) {
    console.error(
      "[db] resolveSqlitePath failed:",
      error instanceof Error ? error.message : error
    );
    const fallback = join(process.cwd(), DATA_DIR, PROD_FILE);
    ensureParentDir(fallback);
    return fallback;
  }
}

export function getSqliteFileUrl(): string {
  return `file:${resolveSqlitePath().replace(/\\/g, "/")}`;
}
