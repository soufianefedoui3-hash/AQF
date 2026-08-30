/**
 * AQF SQLite layer — Node runtime only.
 *
 * - No Prisma CLI, no generate, no migrate on boot.
 * - CREATE TABLE IF NOT EXISTS on first successful open.
 * - Every helper swallows driver/FS errors so a missing DB cannot 500 a page.
 */
import { ensureSchema, execute, getDb, newId, query, queryOne } from "./client";
import { ensureSeeded } from "./seed";
import { getSqliteFileUrl, resolveSqlitePath } from "./path";

export type { ExecuteResult, QueryResult, SqlDatabase } from "./types";
export {
  ensureSchema,
  ensureSeeded,
  execute,
  getDb,
  getSqliteFileUrl,
  newId,
  query,
  queryOne,
  resolveSqlitePath,
};

/**
 * Open + schema only. Seed (bcrypt) runs in the background so Hostinger
 * requests never sit on an 8s timeout while the hash is computed.
 */
export async function readyDb(): Promise<boolean> {
  try {
    if (!ensureSchema() || !getDb()) {
      return false;
    }
    void ensureSeeded().catch((error) => {
      console.warn(
        "[db] background seed failed:",
        error instanceof Error ? error.message : error
      );
    });
    return true;
  } catch (error) {
    console.error(
      "[db] readyDb failed:",
      error instanceof Error ? error.message : error
    );
    return getDb() !== null;
  }
}
