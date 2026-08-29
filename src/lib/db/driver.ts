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
  try {
    if (typeof raw.pragma === "function") {
      raw.pragma("journal_mode = WAL");
      raw.pragma("foreign_keys = ON");
      raw.pragma("busy_timeout = 5000");
      return;
    }
    raw.exec("PRAGMA journal_mode = WAL");
    raw.exec("PRAGMA foreign_keys = ON");
    raw.exec("PRAGMA busy_timeout = 5000");
  } catch (error) {
    console.warn(
      "[db] PRAGMA setup skipped:",
      error instanceof Error ? error.message : error
    );
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
      DatabaseSync?: new (path: string) => RawDb;
    };
    if (!nodeSqlite.DatabaseSync) return null;
    return wrapRaw(filePath, "node:sqlite", new nodeSqlite.DatabaseSync(filePath));
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
    const BetterSqlite = require("better-sqlite3") as new (path: string) => RawDb;
    return wrapRaw(filePath, "better-sqlite3", new BetterSqlite(filePath));
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
