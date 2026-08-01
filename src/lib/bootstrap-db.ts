import { existsSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";
import { fixAdminAccount, type AdminFixResult } from "@/lib/ensure-admin";

export interface BootstrapResult {
  ok: boolean;
  skipped?: boolean;
  databaseUrl: string;
  admin?: AdminFixResult;
  error?: string;
}

function runPrismaDbPush(): void {
  const prismaEntry = join(process.cwd(), "node_modules", "prisma", "build", "index.js");

  if (!existsSync(prismaEntry)) {
    throw new Error("Prisma CLI not found. Run npm install before bootstrapping.");
  }

  const result = spawnSync(process.execPath, [prismaEntry, "db", "push", "--skip-generate", "--accept-data-loss"], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`prisma db push exited with code ${result.status ?? "unknown"}`);
  }
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
    runPrismaDbPush();
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
