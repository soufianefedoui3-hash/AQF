import { SQLITE_SCHEMA_SQL } from "./schema";
import { openSqlite } from "./driver";
import { resolveSqlitePath } from "./path";
import type { ExecuteResult, QueryResult, SqlDatabase, SqlValue } from "./types";

const globalForDb = globalThis as unknown as {
  aqfSqlite?: SqlDatabase | null;
  aqfSchemaReady?: boolean;
};

function applySchema(database: SqlDatabase): boolean {
  try {
    for (const statement of SQLITE_SCHEMA_SQL) {
      database.exec(statement);
    }
    globalForDb.aqfSchemaReady = true;
    return true;
  } catch (error) {
    console.error(
      "[db] Schema apply failed:",
      error instanceof Error ? error.message : error
    );
    globalForDb.aqfSchemaReady = false;
    return false;
  }
}

/**
 * Returns a live SQLite connection, or null if the file/driver cannot open.
 * Never throws. Schema is created lazily on first successful open.
 */
export function getDb(): SqlDatabase | null {
  if (globalForDb.aqfSqlite) {
    return globalForDb.aqfSqlite;
  }

  try {
    const filePath = resolveSqlitePath();
    const database = openSqlite(filePath);
    if (!database) {
      return null;
    }

    globalForDb.aqfSqlite = database;
    if (!globalForDb.aqfSchemaReady) {
      applySchema(database);
    }

    return database;
  } catch (error) {
    console.error(
      "[db] getDb failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export function ensureSchema(): boolean {
  try {
    const database = getDb();
    if (!database) return false;
    // Always re-apply CREATE TABLE IF NOT EXISTS so newly added tables
    // appear on existing DBs and after Next.js hot reload.
    return applySchema(database);
  } catch (error) {
    console.error(
      "[db] ensureSchema failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = []
): QueryResult<T> {
  try {
    const database = getDb();
    if (!database) {
      return { ok: false, rows: [], error: "database_unavailable" };
    }
    const rows = database.prepare(sql).all(...params) as T[];
    return { ok: true, rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[db] query failed:", message);
    return { ok: false, rows: [], error: message };
  }
}

export function queryOne<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = []
): T | null {
  try {
    const database = getDb();
    if (!database) return null;
    const row = database.prepare(sql).get(...params);
    return (row as T | undefined) ?? null;
  } catch (error) {
    console.error(
      "[db] queryOne failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export function execute(sql: string, params: SqlValue[] = []): ExecuteResult {
  try {
    const database = getDb();
    if (!database) {
      return { ok: false, changes: 0, error: "database_unavailable" };
    }
    const result = database.prepare(sql).run(...params);
    return { ok: true, changes: result.changes };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[db] execute failed:", message);
    return { ok: false, changes: 0, error: message };
  }
}

export function newId(): string {
  return crypto.randomUUID();
}

export function resetDbCache(): void {
  globalForDb.aqfSqlite = undefined;
  globalForDb.aqfSchemaReady = false;
  const globalForPath = globalThis as unknown as { aqfSqlitePath?: string };
  globalForPath.aqfSqlitePath = undefined;
}
