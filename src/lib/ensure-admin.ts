import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { databaseFileExists, getDatabasePath } from "@/lib/database-url";

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

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "admin@aqf.ma").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Admin@AQF2026",
  };
}

export async function getAdminStatus(): Promise<AdminStatusResult> {
  const { email, password } = getAdminCredentials();
  const existing = await prisma.admin.findUnique({ where: { email } });

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

/**
 * Creates, resets, or repairs the admin account.
 * Repairs automatically when the stored bcrypt hash does not match ADMIN_PASSWORD.
 */
export async function fixAdminAccount(options: { force?: boolean } = {}): Promise<AdminFixResult> {
  const { email, password } = getAdminCredentials();
  const force = options.force === true || process.env.ADMIN_FORCE_RESET === "true";
  const existing = await prisma.admin.findUnique({ where: { email } });

  const base = {
    email,
    databasePath: getDatabasePath(),
    databaseExists: databaseFileExists(),
  };

  if (!existing) {
    const passwordHash = await hashPassword(password);
    await prisma.admin.create({ data: { email, passwordHash } });

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
  await prisma.admin.update({
    where: { email },
    data: { passwordHash },
  });

  return {
    ...base,
    created: false,
    reset: force,
    repaired: !force,
    verified: false,
    message: force ? "Admin password reset" : "Admin password repaired",
  };
}

/** @deprecated Use fixAdminAccount() */
export async function ensureAdminAccount(forceReset = false): Promise<AdminFixResult> {
  return fixAdminAccount({ force: forceReset });
}
