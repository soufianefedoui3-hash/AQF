import { createRequire } from "module";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { spawnSync } from "child_process";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";
import { fixAdminAccount, type AdminFixResult } from "@/lib/ensure-admin";
import { SQLITE_SCHEMA_STATEMENTS } from "@/lib/sql-schema";
import { prisma } from "@/lib/prisma";

export interface BootstrapResult {
  ok: boolean;
  skipped?: boolean;
  databaseUrl: string;
  admin?: AdminFixResult;
  error?: string;
}

let schemaInitPromise: Promise<boolean> | null = null;

function resolvePrismaCliEntry(): { type: "node" | "bin"; path: string } | null {
  const candidates: string[] = [];

  try {
    const require = createRequire(join(process.cwd(), "package.json"));
    const prismaPackageJson = require.resolve("prisma/package.json");
    candidates.push(join(dirname(prismaPackageJson), "build", "index.js"));
  } catch {
    /* prisma package may be unavailable at runtime */
  }

  candidates.push(
    join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
    join(process.cwd(), "node_modules", "prisma", "build", "index.mjs")
  );

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return { type: "node", path: candidate };
    }
  }

  const binCandidates = [
    join(process.cwd(), "node_modules", ".bin", "prisma"),
    join(process.cwd(), "node_modules", ".bin", "prisma.cmd"),
  ];

  for (const candidate of binCandidates) {
    if (existsSync(candidate)) {
      return { type: "bin", path: candidate };
    }
  }

  return null;
}

function runPrismaCliPush(): boolean {
  const resolved = resolvePrismaCliEntry();
  if (!resolved) return false;

  const args = ["db", "push", "--skip-generate", "--accept-data-loss"];
  const result =
    resolved.type === "node"
      ? spawnSync(process.execPath, [resolved.path, ...args], {
          stdio: "inherit",
          env: process.env,
          cwd: process.cwd(),
        })
      : spawnSync(resolved.path, args, {
          stdio: "inherit",
          env: process.env,
          cwd: process.cwd(),
          shell: process.platform === "win32",
        });

  return !result.error && result.status === 0;
}

async function applySqlSchemaFallback(): Promise<void> {
  for (const statement of SQLITE_SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement);
  }
}

export function resetDatabaseSchemaCache(): void {
  schemaInitPromise = null;
}

/**
 * Lazily creates missing SQLite tables once per process.
 * Prefers Prisma CLI, falls back to raw SQL via Prisma Client.
 */
export async function ensureDatabaseSchema(): Promise<boolean> {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    return true;
  }

  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      try {
        const databaseUrl = resolveProductionDatabaseUrl();
        console.log(`[db] Ensuring schema at ${databaseUrl}`);

        if (runPrismaCliPush()) {
          console.log("[db] Schema ensured via Prisma CLI.");
          return true;
        }

        console.warn(
          "[db] Prisma CLI unavailable or failed — applying SQL schema fallback."
        );
        await applySqlSchemaFallback();
        console.log("[db] Schema ensured via SQL fallback.");
        return true;
      } catch (error) {
        console.error(
          "[db] Schema ensure failed:",
          error instanceof Error ? error.message : error
        );
        schemaInitPromise = null;
        return false;
      }
    })();
  }

  return schemaInitPromise;
}

/**
 * Syncs the SQLite schema and ensures the admin account exists.
 * Used by deploy hooks and authenticated setup API routes.
 */
export async function bootstrapProductionDatabase(options: {
  forceAdmin?: boolean;
} = {}): Promise<BootstrapResult> {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    return {
      ok: true,
      skipped: true,
      databaseUrl: process.env.DATABASE_URL || "",
    };
  }

  try {
    const databaseUrl = resolveProductionDatabaseUrl();
    await ensureDatabaseSchema();
    const admin = await fixAdminAccount({ force: options.forceAdmin });

    return { ok: true, databaseUrl, admin };
  } catch (error) {
    return {
      ok: false,
      databaseUrl: process.env.DATABASE_URL || "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
