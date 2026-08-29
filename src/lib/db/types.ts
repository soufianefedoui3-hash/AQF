export type SqlValue = string | number | bigint | Buffer | null;

export interface SqlStatement {
  all(...params: SqlValue[]): Record<string, unknown>[];
  get(...params: SqlValue[]): Record<string, unknown> | undefined;
  run(...params: SqlValue[]): { changes: number };
}

export interface SqlDatabase {
  readonly filePath: string;
  readonly driver: "node:sqlite" | "better-sqlite3";
  exec(sql: string): void;
  prepare(sql: string): SqlStatement;
}

export interface QueryResult<T> {
  ok: boolean;
  rows: T[];
  error?: string;
}

export interface ExecuteResult {
  ok: boolean;
  changes: number;
  error?: string;
}
