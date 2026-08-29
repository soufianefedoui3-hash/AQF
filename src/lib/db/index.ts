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
 * Call from server pages / route handlers that need a ready database.
 * Safe to invoke on every request — schema and seed run once per process.
 */
export async function readyDb(): Promise<boolean> {
  try {
    const schemaOk = ensureSchema();
    if (!schemaOk) return false;
    return await ensureSeeded();
  } catch (error) {
    console.error(
      "[db] readyDb failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
