import { execute, newId, queryOne, readyDb } from "@/lib/db";
import { databaseFileExists, getDatabasePath } from "@/lib/database-url";
import { getAdminCredentials } from "@/lib/env-credentials";
import { hashPassword, verifyPassword } from "@/lib/password";

export { getAdminCredentials };

export interface AdminFixResult {
  email: string;
  created: boolean;
  reset: boolean;
  repaired: boolean;
  verified: boolean;
  message: string;
  databasePath: string | null;
  databaseExists: boolean;
}

export interface AdminStatusResult {
  email: string;
  exists: boolean;
  passwordValid: boolean;
  databasePath: string | null;
  databaseExists: boolean;
}

type AdminRow = { id: string; email: string; passwordHash: string };

async function findAdmin(email: string): Promise<AdminRow | null> {
  await readyDb();
  const row = queryOne<AdminRow>(
    `SELECT id, email, passwordHash FROM "Admin" WHERE email = ?`,
    [email]
  );
  return row;
}

export async function getAdminStatus(): Promise<AdminStatusResult> {
  const { email, password } = getAdminCredentials();
  const existing = await findAdmin(email);

  if (!existing) {
    return {
      email,
      exists: false,
      passwordValid: false,
      databasePath: getDatabasePath(),
      databaseExists: databaseFileExists(),
    };
  }

  let passwordValid = false;
  try {
    passwordValid = await verifyPassword(password, existing.passwordHash);
  } catch {
    passwordValid = false;
  }

  return {
    email,
    exists: true,
    passwordValid,
    databasePath: getDatabasePath(),
    databaseExists: databaseFileExists(),
  };
}

export async function fixAdminAccount(
  options: { force?: boolean } = {}
): Promise<AdminFixResult> {
  const { email, password } = getAdminCredentials();
  const force = options.force === true || process.env.ADMIN_FORCE_RESET === "true";
  const existing = await findAdmin(email);
  const base = {
    email,
    databasePath: getDatabasePath(),
    databaseExists: databaseFileExists(),
  };

  if (!existing) {
    const passwordHash = await hashPassword(password);
    execute(
      `INSERT INTO "Admin" ("id", "email", "passwordHash") VALUES (?, ?, ?)`,
      [newId(), email, passwordHash]
    );
    return {
      ...base,
      created: true,
      reset: false,
      repaired: false,
      verified: false,
      message: "Admin account created",
    };
  }

  if (!force) {
    try {
      const valid = await verifyPassword(password, existing.passwordHash);
      if (valid) {
        return {
          ...base,
          created: false,
          reset: false,
          repaired: false,
          verified: true,
          message: "Admin credentials verified",
        };
      }
    } catch {
      /* fall through to repair */
    }
  }

  const passwordHash = await hashPassword(password);
  execute(`UPDATE "Admin" SET "passwordHash" = ? WHERE "email" = ?`, [
    passwordHash,
    email,
  ]);

  return {
    ...base,
    created: false,
    reset: force,
    repaired: !force,
    verified: false,
    message: force ? "Admin password reset" : "Admin password repaired",
  };
}

export async function ensureAdminAccount(
  forceReset = false
): Promise<AdminFixResult> {
  return fixAdminAccount({ force: forceReset });
}
