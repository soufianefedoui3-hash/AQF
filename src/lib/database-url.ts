import { existsSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";

const DEFAULT_RELATIVE_DB = "file:./dev.db";

/**
 * Ensures SQLite uses a writable absolute path in production.
 * Must run before PrismaClient connects on hosts like Hostinger.
 */
export function resolveProductionDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();

  if (configured && configured !== DEFAULT_RELATIVE_DB) {
    if (configured.startsWith("file:")) {
      const rawPath = configured.replace(/^file:/, "");
      const absolutePath =
        rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath)
          ? rawPath
          : resolve(process.cwd(), rawPath);

      mkdirSync(dirname(absolutePath), { recursive: true });
      process.env.DATABASE_URL = `file:${absolutePath.replace(/\\/g, "/")}`;
    }

    return process.env.DATABASE_URL!;
  }

  const dbPath = join(process.cwd(), "prisma", "production.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, "/")}`;
  return process.env.DATABASE_URL;
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
