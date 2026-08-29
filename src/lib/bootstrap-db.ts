import { getSqliteFileUrl, readyDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/client";
import { fixAdminAccount, type AdminFixResult } from "@/lib/ensure-admin";

export interface BootstrapResult {
  ok: boolean;
  skipped?: boolean;
  databaseUrl: string;
  admin?: AdminFixResult;
  error?: string;
}

export async function ensureDatabaseSchema(): Promise<boolean> {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    return true;
  }

  try {
    return ensureSchema();
  } catch (error) {
    console.error(
      "[db] Schema ensure failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export async function bootstrapProductionDatabase(
  options: { forceAdmin?: boolean } = {}
): Promise<BootstrapResult> {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    return {
      ok: true,
      skipped: true,
      databaseUrl: getSqliteFileUrl(),
    };
  }

  try {
    const databaseUrl = getSqliteFileUrl();
    const ready = await readyDb();
    if (!ready) {
      return {
        ok: false,
        databaseUrl,
        error: "SQLite schema or seed failed",
      };
    }

    const admin = await fixAdminAccount({ force: options.forceAdmin });
    return { ok: true, databaseUrl, admin };
  } catch (error) {
    return {
      ok: false,
      databaseUrl: getSqliteFileUrl(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
