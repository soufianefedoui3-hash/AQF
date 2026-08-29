import { existsSync } from "fs";
import { getSqliteFileUrl, resolveSqlitePath } from "@/lib/db/path";

/** Compatibility helpers around the SQLite file path. */
export function resolveDatabaseUrl(): string {
  try {
    const url = getSqliteFileUrl();
    process.env.DATABASE_URL = url;
    return url;
  } catch (error) {
    console.error(
      "[db] resolveDatabaseUrl failed:",
      error instanceof Error ? error.message : error
    );
    const fallback = getSqliteFileUrl();
    process.env.DATABASE_URL = fallback;
    return fallback;
  }
}

/** @deprecated Use resolveDatabaseUrl — kept for existing imports. */
export function resolveProductionDatabaseUrl(): string {
  return resolveDatabaseUrl();
}

export function getProductionDatabasePath(): string {
  return resolveSqlitePath();
}

export function getDatabasePath(): string | null {
  try {
    return resolveSqlitePath();
  } catch {
    const url = process.env.DATABASE_URL;
    if (!url?.startsWith("file:")) return null;
    return url.replace(/^file:/, "");
  }
}

export function databaseFileExists(): boolean {
  const path = getDatabasePath();
  return path ? existsSync(path) : false;
}
