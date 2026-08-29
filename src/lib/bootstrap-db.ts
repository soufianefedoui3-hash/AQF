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
 *
 * IMPORTANT (Hostinger): never spawn Prisma CLI here while `next start` is
 * serving. spawnSync + stdio inherit during a live server race with Hostinger's
 * double-boot / Server.close() and produces `Error: Server is not running`.
 * Deploy-time schema push stays in scripts/push-schema.mjs / deploy-db.mjs.
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
