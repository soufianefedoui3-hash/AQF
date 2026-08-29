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
 *
 * Important: only `NODE_ENV === "development"` uses the local dev.db.
 * Unset / production / staging always use prisma/production.db for default
 * relative URLs — Hostinger often omits NODE_ENV, which previously caused
 * admin writes and public reads to hit different database files.
 */
export function resolveDatabaseUrl(): string {
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

  // Production / unset NODE_ENV / anything else → stable production.db
  // unless an explicit non-default file path was configured.
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
