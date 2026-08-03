import { existsSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";

const DEFAULT_RELATIVE_DB = "file:./dev.db";
const PRODUCTION_DB_RELATIVE = join("prisma", "production.db");

function toFileUrl(absolutePath: string): string {
  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

function ensureDirectoryForFile(absolutePath: string): void {
  mkdirSync(dirname(absolutePath), { recursive: true });
}

function absolutizeFileUrl(fileUrl: string): string {
  const rawPath = fileUrl.replace(/^file:/, "");
  const absolutePath =
    rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath)
      ? rawPath
      : resolve(process.cwd(), rawPath);

  ensureDirectoryForFile(absolutePath);
  return toFileUrl(absolutePath);
}

/**
 * Resolves SQLite to a stable absolute file URL.
 * In production, remaps default/dev relative paths to prisma/production.db.
 * In development, keeps the configured DATABASE_URL (typically file:./dev.db).
 */
export function resolveProductionDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    if (configured?.startsWith("file:")) {
      const url = absolutizeFileUrl(configured);
      process.env.DATABASE_URL = url;
      return url;
    }

    const fallback = configured || DEFAULT_RELATIVE_DB;
    if (fallback.startsWith("file:")) {
      const url = absolutizeFileUrl(fallback);
      process.env.DATABASE_URL = url;
      return url;
    }

    return fallback;
  }

  const useProductionDefault =
    !configured ||
    configured === DEFAULT_RELATIVE_DB ||
    configured === "file:./prisma/dev.db" ||
    configured === "file:./dev.db";

  if (useProductionDefault) {
    const dbPath = join(process.cwd(), PRODUCTION_DB_RELATIVE);
    ensureDirectoryForFile(dbPath);
    const url = toFileUrl(dbPath);
    process.env.DATABASE_URL = url;
    return url;
  }

  if (configured.startsWith("file:")) {
    const url = absolutizeFileUrl(configured);
    process.env.DATABASE_URL = url;
    return url;
  }

  const dbPath = join(process.cwd(), PRODUCTION_DB_RELATIVE);
  ensureDirectoryForFile(dbPath);
  const url = toFileUrl(dbPath);
  process.env.DATABASE_URL = url;
  return url;
}

export function getProductionDatabasePath(): string {
  return join(process.cwd(), PRODUCTION_DB_RELATIVE);
}

export function getDatabasePath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return null;
  return url.replace(/^file:/, "");
}

export function databaseFileExists(): boolean {
  const path = getDatabasePath();
  return path ? existsSync(path) : false;
}
