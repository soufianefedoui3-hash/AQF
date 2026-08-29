import { existsSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";

const DEFAULT_RELATIVE_DB = "file:./dev.db";
const PRODUCTION_DB_RELATIVE = join("prisma", "production.db");

function toFileUrl(absolutePath: string): string {
  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

function ensureDirectoryForFile(absolutePath: string): void {
  try {
    mkdirSync(dirname(absolutePath), { recursive: true });
  } catch (error) {
    // Never crash the app process if the directory already exists
    // or the filesystem is temporarily read-only.
    console.warn(
      "[db] Could not ensure DB directory:",
      error instanceof Error ? error.message : error
    );
  }
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

function isDefaultRelativeSqliteUrl(url: string): boolean {
  return (
    url === DEFAULT_RELATIVE_DB ||
    url === "file:./dev.db" ||
    url === "file:./prisma/dev.db" ||
    url === "file:prisma/dev.db" ||
    url === "file:dev.db"
  );
}

/**
 * Resolves SQLite to one stable absolute file URL for the whole process.
 * Only NODE_ENV === "development" uses the local dev.db; everything else
 * (including unset NODE_ENV on Hostinger) uses prisma/production.db.
 */
export function resolveDatabaseUrl(): string {
  try {
    const configured = process.env.DATABASE_URL?.trim();
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      const source = configured?.startsWith("file:")
        ? configured
        : configured || DEFAULT_RELATIVE_DB;
      if (source.startsWith("file:")) {
        const url = absolutizeFileUrl(source);
        process.env.DATABASE_URL = url;
        return url;
      }
      return source;
    }

    if (configured?.startsWith("file:") && !isDefaultRelativeSqliteUrl(configured)) {
      const url = absolutizeFileUrl(configured);
      process.env.DATABASE_URL = url;
      return url;
    }

    const dbPath = join(process.cwd(), PRODUCTION_DB_RELATIVE);
    ensureDirectoryForFile(dbPath);
    const url = toFileUrl(dbPath);
    process.env.DATABASE_URL = url;
    return url;
  } catch (error) {
    console.error(
      "[db] resolveDatabaseUrl failed, using in-memory fallback path:",
      error instanceof Error ? error.message : error
    );
    const fallback = toFileUrl(join(process.cwd(), PRODUCTION_DB_RELATIVE));
    process.env.DATABASE_URL = fallback;
    return fallback;
  }
}

/** @deprecated Use resolveDatabaseUrl — kept for existing imports. */
export function resolveProductionDatabaseUrl(): string {
  return resolveDatabaseUrl();
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
