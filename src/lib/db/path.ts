import {
  copyFileSync,
  existsSync,
  mkdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { dirname, isAbsolute, join, resolve, sep } from "path";

const DATA_DIR = "data";
const DEV_FILE = "dev.sqlite";
const PROD_FILE = "aqf.sqlite";
const LEGACY_DEV = join("prisma", "dev.db");
const LEGACY_PROD = join("prisma", "production.db");
const HOSTINGER_USER_DATA = "/home/u784461488/domains/aqf.ma/data";
const DEFAULT_DOMAIN = "aqf.ma";

const DEFAULT_DEV_URLS = new Set([
  "file:./dev.db",
  "file:./prisma/dev.db",
  "file:prisma/dev.db",
  "file:dev.db",
]);

const globalForPath = globalThis as unknown as {
  aqfSqlitePath?: string;
  aqfSqlitePathLogged?: boolean;
};

function toAbsoluteFile(fileUrlOrPath: string): string {
  const trimmed = fileUrlOrPath.trim();
  const raw = trimmed.startsWith("file:") ? trimmed.slice("file:".length) : trimmed;
  if (isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) {
    return raw;
  }
  return resolve(process.cwd(), raw);
}

function isAbsoluteFile(fileUrlOrPath: string): boolean {
  const trimmed = fileUrlOrPath.trim();
  const raw = trimmed.startsWith("file:") ? trimmed.slice("file:".length) : trimmed;
  return isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw);
}

function ensureParentDir(filePath: string): boolean {
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    return true;
  } catch (error) {
    console.warn(
      "[db] Could not create database directory:",
      dirname(filePath),
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

function dirIsWritable(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true });
    const probe = join(dir, ".aqf-write-test");
    writeFileSync(probe, "ok");
    unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function copySidecar(source: string, target: string, suffix: string): void {
  const from = `${source}${suffix}`;
  if (!existsSync(from)) return;
  try {
    copyFileSync(from, `${target}${suffix}`);
  } catch {
    // WAL/SHM copy is best-effort
  }
}

function migrateIfNeeded(target: string, sources: string[]): void {
  if (existsSync(target) && statSync(target).size > 0) return;
  for (const source of sources) {
    if (!source || source === target) continue;
    if (!existsSync(source)) continue;
    try {
      if (statSync(source).size <= 0) continue;
      if (!ensureParentDir(target)) continue;
      copyFileSync(source, target);
      copySidecar(source, target, "-wal");
      copySidecar(source, target, "-shm");
      console.log(`[db] Migrated SQLite ${source} → ${target}`);
      return;
    } catch (error) {
      console.warn(
        "[db] Could not migrate",
        source,
        "→",
        target,
        error instanceof Error ? error.message : error
      );
    }
  }
}

function homeDir(): string {
  return (process.env.HOME || process.env.USERPROFILE || "").trim();
}

function isHostingerEnv(): boolean {
  const home = homeDir();
  const cwd = process.cwd();
  return (
    /^\/home\/u\d+/.test(home) ||
    cwd.includes(`${sep}domains${sep}`) ||
    cwd.includes("/domains/") ||
    cwd.includes("/home/u") ||
    existsSync(HOSTINGER_USER_DATA) ||
    existsSync(join(home, "domains"))
  );
}

function domainFromCwd(cwd: string): string | null {
  const normalized = cwd.replace(/\\/g, "/");
  const match = normalized.match(/\/domains\/([^/]+)/);
  return match?.[1] || null;
}

/** Persistent Hostinger dir — sibling of public_html / app releases, not inside them. */
function persistentCandidates(): string[] {
  const home = homeDir();
  const domain =
    process.env.AQF_DOMAIN?.trim() ||
    domainFromCwd(process.cwd()) ||
    DEFAULT_DOMAIN;
  const files: string[] = [];

  if (process.env.AQF_DATA_DIR?.trim()) {
    files.push(join(toAbsoluteFile(process.env.AQF_DATA_DIR), PROD_FILE));
  }
  if (home) {
    files.push(join(home, "domains", domain, DATA_DIR, PROD_FILE));
    files.push(join(home, "aqf-data", PROD_FILE));
  }
  files.push(join(HOSTINGER_USER_DATA, PROD_FILE));
  return files;
}

function ephemeralSources(): string[] {
  const cwd = process.cwd();
  return [
    join(cwd, DATA_DIR, PROD_FILE),
    join(cwd, LEGACY_PROD),
    join(cwd, DATA_DIR, DEV_FILE),
    join(cwd, LEGACY_DEV),
  ];
}

function firstWritableFile(candidates: string[]): string | null {
  for (const file of candidates) {
    if (dirIsWritable(dirname(file))) {
      return file;
    }
  }
  return null;
}

function pickProductionPath(): string {
  const explicitPath = process.env.DATABASE_PATH?.trim();
  const configuredUrl = process.env.DATABASE_URL?.trim();

  if (explicitPath && isAbsoluteFile(explicitPath)) {
    const absolute = toAbsoluteFile(explicitPath);
    ensureParentDir(absolute);
    return absolute;
  }

  if (
    configuredUrl?.startsWith("file:") &&
    !DEFAULT_DEV_URLS.has(configuredUrl) &&
    isAbsoluteFile(configuredUrl)
  ) {
    const absolute = toAbsoluteFile(configuredUrl);
    ensureParentDir(absolute);
    return absolute;
  }

  if (isHostingerEnv()) {
    const persistent = firstWritableFile(persistentCandidates());
    if (persistent) {
      migrateIfNeeded(persistent, [
        explicitPath ? toAbsoluteFile(explicitPath) : "",
        configuredUrl ? toAbsoluteFile(configuredUrl) : "",
        ...ephemeralSources(),
      ]);
      return persistent;
    }
  }

  const preferred = join(process.cwd(), DATA_DIR, PROD_FILE);
  const legacy = join(process.cwd(), LEGACY_PROD);
  if (!existsSync(preferred) && existsSync(legacy)) {
    ensureParentDir(preferred);
    return legacy;
  }
  ensureParentDir(preferred);
  return preferred;
}

function pickDevelopmentPath(): string {
  const explicitPath = process.env.DATABASE_PATH?.trim();
  if (explicitPath) {
    const absolute = toAbsoluteFile(explicitPath);
    ensureParentDir(absolute);
    return absolute;
  }
  const preferred = join(process.cwd(), DATA_DIR, DEV_FILE);
  const legacy = join(process.cwd(), LEGACY_DEV);
  if (!existsSync(preferred) && existsSync(legacy)) {
    ensureParentDir(preferred);
    return legacy;
  }
  ensureParentDir(preferred);
  return preferred;
}

/**
 * One stable on-disk SQLite file for the whole process.
 * Development → <cwd>/data/dev.sqlite
 * Production on Hostinger → /home/<user>/domains/aqf.ma/data/aqf.sqlite
 *   (outside deploy/release folders so admin edits survive refresh + redeploy)
 */
export function resolveSqlitePath(): string {
  if (globalForPath.aqfSqlitePath) {
    return globalForPath.aqfSqlitePath;
  }

  try {
    const isDev = process.env.NODE_ENV === "development";
    const chosen = isDev ? pickDevelopmentPath() : pickProductionPath();
    globalForPath.aqfSqlitePath = chosen;
    if (!globalForPath.aqfSqlitePathLogged) {
      globalForPath.aqfSqlitePathLogged = true;
      console.log("[db] Persistent SQLite file:", chosen);
    }
    return chosen;
  } catch (error) {
    console.error(
      "[db] resolveSqlitePath failed:",
      error instanceof Error ? error.message : error
    );
    const fallback = join(process.cwd(), DATA_DIR, PROD_FILE);
    ensureParentDir(fallback);
    globalForPath.aqfSqlitePath = fallback;
    return fallback;
  }
}

export function getSqliteFileUrl(): string {
  return `file:${resolveSqlitePath().replace(/\\/g, "/")}`;
}
