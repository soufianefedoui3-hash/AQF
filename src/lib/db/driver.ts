import { createRequire } from "module";
import type { SqlDatabase, SqlStatement, SqlValue } from "./types";

function loadRequire(): NodeRequire {
  try {
    if (typeof __filename !== "undefined") {
      return createRequire(__filename);
    }
  } catch {
    /* bundled ESM may not define __filename */
  }
  return createRequire(import.meta.url);
}

const requireFromHere = loadRequire();

function wrapStatement(
  all: (...params: SqlValue[]) => Record<string, unknown>[],
  get: (...params: SqlValue[]) => Record<string, unknown> | undefined,
  run: (...params: SqlValue[]) => { changes: number }
): SqlStatement {
  return {
    all: (...params) => {
      try {
        return all(...params) ?? [];
      } catch (error) {
        console.error("[db] statement.all failed:", error);
        return [];
      }
    },
    get: (...params) => {
      try {
        return get(...params);
      } catch (error) {
        console.error("[db] statement.get failed:", error);
        return undefined;
      }
    },
    run: (...params) => {
      try {
        const result = run(...params);
        return { changes: Number(result?.changes ?? 0) };
      } catch (error) {
        console.error("[db] statement.run failed:", error);
        return { changes: 0 };
      }
    },
  };
}

function applyPragmas(exec: (sql: string) => void): void {
  try {
    exec("PRAGMA journal_mode = WAL");
    exec("PRAGMA foreign_keys = ON");
    exec("PRAGMA busy_timeout = 5000");
  } catch (error) {
    console.warn(
      "[db] PRAGMA setup skipped:",
      error instanceof Error ? error.message : error
    );
  }
}

function openNodeSqlite(filePath: string): SqlDatabase | null {
  try {
    const nodeSqlite = requireFromHere("node:sqlite") as {
      DatabaseSync?: new (path: string) => {
        exec(sql: string): void;
        prepare(sql: string): {
          all: (...params: SqlValue[]) => Record<string, unknown>[];
          get: (...params: SqlValue[]) => Record<string, unknown> | undefined;
          run: (...params: SqlValue[]) => { changes: number };
        };
      };
    };

    if (!nodeSqlite.DatabaseSync) return null;

    const raw = new nodeSqlite.DatabaseSync(filePath);
    applyPragmas((sql) => raw.exec(sql));

    return {
      filePath,
      driver: "node:sqlite",
      exec: (sql) => raw.exec(sql),
      prepare: (sql) => {
        const stmt = raw.prepare(sql);
        return wrapStatement(
          (...params) => stmt.all(...params),
          (...params) => stmt.get(...params),
          (...params) => stmt.run(...params)
        );
      },
    };
  } catch {
    return null;
  }
}

function openBetterSqlite(filePath: string): SqlDatabase | null {
  try {
    const BetterSqlite = requireFromHere("better-sqlite3") as new (
      path: string
    ) => {
      pragma(src: string): unknown;
      exec(sql: string): void;
      prepare(sql: string): {
        all: (...params: SqlValue[]) => Record<string, unknown>[];
        get: (...params: SqlValue[]) => Record<string, unknown> | undefined;
        run: (...params: SqlValue[]) => { changes: number };
      };
    };

    const raw = new BetterSqlite(filePath);
    try {
      raw.pragma("journal_mode = WAL");
      raw.pragma("foreign_keys = ON");
      raw.pragma("busy_timeout = 5000");
    } catch {
      applyPragmas((sql) => raw.exec(sql));
    }

    return {
      filePath,
      driver: "better-sqlite3",
      exec: (sql) => raw.exec(sql),
      prepare: (sql) => {
        const stmt = raw.prepare(sql);
        return wrapStatement(
          (...params) => stmt.all(...params),
          (...params) => stmt.get(...params),
          (...params) => stmt.run(...params)
        );
      },
    };
  } catch {
    return null;
  }
}

/**
 * Open SQLite without Prisma.
 * Prefers Node's built-in driver (no native compile), then better-sqlite3.
 * Returns null instead of throwing so callers can serve static fallbacks.
 */
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
