import { bootstrapProductionDatabase } from "@/lib/bootstrap-db";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";
import { credentialsMatchEnv, getAdminCredentials } from "@/lib/env-credentials";
import { fixAdminAccount } from "@/lib/ensure-admin";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export interface AdminAuthSuccess {
  success: true;
  adminId: string;
  email: string;
  source: "database" | "env-repair" | "env-fallback";
}

export interface AdminAuthFailure {
  success: false;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

function isMissingSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return (
    code === "P2021" ||
    message.includes("no such table") ||
    message.includes("does not exist")
  );
}

async function findVerifiedAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;

  const valid = await verifyPassword(password, admin.passwordHash).catch(() => false);
  if (!valid) return null;

  return admin;
}

async function ensureSchemaAndAdmin(forceAdmin = false) {
  const bootstrap = await bootstrapProductionDatabase({ forceAdmin });
  if (!bootstrap.ok && bootstrap.error) {
    console.error("[admin-login] Bootstrap failed:", bootstrap.error);
  }
}

/**
 * Authenticates an admin using the SQLite record, with env-var repair/fallback.
 * Runs a lightweight runtime bootstrap because Hostinger build-time DB files
 * are often not present at runtime.
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminAuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { success: false };
  }

  resolveProductionDatabaseUrl();

  try {
    let admin = await findVerifiedAdmin(normalizedEmail, normalizedPassword);
    if (admin) {
      return {
        success: true,
        adminId: admin.id,
        email: admin.email,
        source: "database",
      };
    }
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      console.error("[admin-login] Database lookup failed:", error);
    }

    await ensureSchemaAndAdmin(true);
  }

  try {
    let admin = await findVerifiedAdmin(normalizedEmail, normalizedPassword);
    if (admin) {
      return {
        success: true,
        adminId: admin.id,
        email: admin.email,
        source: "database",
      };
    }

    if (credentialsMatchEnv(normalizedEmail, normalizedPassword)) {
      await ensureSchemaAndAdmin(true);
      await fixAdminAccount({ force: true });

      admin = await findVerifiedAdmin(normalizedEmail, normalizedPassword);
      if (admin) {
        return {
          success: true,
          adminId: admin.id,
          email: admin.email,
          source: "env-repair",
        };
      }

      const { email: envEmail } = getAdminCredentials();
      console.warn("[admin-login] Env credentials accepted; SQLite write unavailable.");
      return {
        success: true,
        adminId: envEmail,
        email: envEmail,
        source: "env-fallback",
      };
    }

    await ensureSchemaAndAdmin(false);
    admin = await findVerifiedAdmin(normalizedEmail, normalizedPassword);
    if (admin) {
      return {
        success: true,
        adminId: admin.id,
        email: admin.email,
        source: "database",
      };
    }
  } catch (error) {
    console.error("[admin-login] Authentication error:", error);

    if (credentialsMatchEnv(normalizedEmail, normalizedPassword)) {
      const { email: envEmail } = getAdminCredentials();
      return {
        success: true,
        adminId: envEmail,
        email: envEmail,
        source: "env-fallback",
      };
    }
  }

  return { success: false };
}
