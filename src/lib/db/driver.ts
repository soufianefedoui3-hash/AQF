import type { SqlDatabase, SqlStatement, SqlValue } from "./types";

type RawStatement = {
  all: (...params: SqlValue[]) => Record<string, unknown>[];
  get: (...params: SqlValue[]) => Record<string, unknown> | undefined;
  run: (...params: SqlValue[]) => { changes: number };
};

type RawDb = {
  exec: (sql: string) => void;
  prepare: (sql: string) => RawStatement;
  pragma?: (src: string) => unknown;
};

function wrapStatement(stmt: RawStatement): SqlStatement {
  return {
    all: (...params) => {
      try {
        return stmt.all(...params) ?? [];
      } catch (error) {
        console.error("[db] statement.all failed:", error);
        return [];
      }
    },
    get: (...params) => {
      try {
        return stmt.get(...params);
      } catch (error) {
        console.error("[db] statement.get failed:", error);
        return undefined;
      }
    },
    run: (...params) => {
      try {
        return { changes: Number(stmt.run(...params)?.changes ?? 0) };
      } catch (error) {
        console.error("[db] statement.run failed:", error);
        return { changes: 0 };
      }
    },
  };
}

function applyPragmas(raw: RawDb): void {
  // Always use exec — node:sqlite's pragma() helper is not the same as
  // better-sqlite3 and can no-op or block on Hostinger.
  const pragmas = [
    "PRAGMA busy_timeout = 8000",
    "PRAGMA journal_mode = WAL",
    "PRAGMA synchronous = NORMAL",
    "PRAGMA foreign_keys = ON",
    "PRAGMA temp_store = MEMORY",
  ];
  for (const sql of pragmas) {
    try {
      raw.exec(sql);
    } catch (error) {
      console.warn(
        "[db] PRAGMA failed:",
        sql,
        error instanceof Error ? error.message : error
      );
    }
  }
}

function wrapRaw(
  filePath: string,
  driver: SqlDatabase["driver"],
  raw: RawDb
): SqlDatabase {
  applyPragmas(raw);
  return {
    filePath,
    driver,
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => wrapStatement(raw.prepare(sql)),
  };
}

function openNodeSqlite(filePath: string): SqlDatabase | null {
  try {
    // Literal require so Next can externalize node:sqlite.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeSqlite = require("node:sqlite") as {
      DatabaseSync?: new (path: string, options?: { timeout?: number }) => RawDb;
    };
    if (!nodeSqlite.DatabaseSync) return null;
    let raw: RawDb;
    try {
      raw = new nodeSqlite.DatabaseSync(filePath, { timeout: 8000 });
    } catch {
      raw = new nodeSqlite.DatabaseSync(filePath);
    }
    return wrapRaw(filePath, "node:sqlite", raw);
  } catch (error) {
    console.warn(
      "[db] node:sqlite unavailable:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

function openBetterSqlite(filePath: string): SqlDatabase | null {
  try {
    // Literal require so Next can externalize better-sqlite3.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BetterSqlite = require("better-sqlite3") as new (
      path: string,
      options?: { timeout?: number }
    ) => RawDb;
    return wrapRaw(filePath, "better-sqlite3", new BetterSqlite(filePath, { timeout: 8000 }));
  } catch (error) {
    console.warn(
      "[db] better-sqlite3 unavailable:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export function openSqlite(filePath: string): SqlDatabase | null {
  const builtin = openNodeSqlite(filePath);
  if (builtin) {
    console.log(`[db] Opened ${filePath} via node:sqlite`);
    return builtin;
  }

  const addon = openBetterSqlite(filePath);
  if (addon) {
    console.log(`[db] Opened ${filePath} via better-sqlite3`);
    return addon;
  }

  console.error(
    "[db] No SQLite driver available. Install Node 22+ or better-sqlite3."
  );
  return null;
}
