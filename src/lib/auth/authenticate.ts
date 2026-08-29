import { timingSafeEqual } from "node:crypto";
import { execute, newId, queryOne, readyDb } from "@/lib/db";
import { getAdminCredentials } from "@/lib/env-credentials";
import { hashPassword, verifyPassword } from "@/lib/password";

function safeEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(String(a ?? ""), "utf8");
    const right = Buffer.from(String(b ?? ""), "utf8");
    if (left.length !== right.length) return false;
    if (left.length === 0) return true;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export type AuthSuccess = {
  ok: true;
  email: string;
  adminId: string;
};

export type AuthFailure = {
  ok: false;
  error: string;
};

type AdminRow = {
  id: string;
  email: string;
  passwordHash: string;
};

async function syncAdminRow(email: string, password: string): Promise<string> {
  try {
    await readyDb();
    const existing = queryOne<AdminRow>(
      `SELECT id, email, passwordHash FROM "Admin" WHERE email = ?`,
      [email]
    );

    if (!existing) {
      const id = newId();
      const passwordHash = await hashPassword(password);
      execute(
        `INSERT INTO "Admin" ("id", "email", "passwordHash") VALUES (?, ?, ?)`,
        [id, email, passwordHash]
      );
      return id;
    }

    let hashOk = false;
    try {
      hashOk = await verifyPassword(password, existing.passwordHash);
    } catch {
      hashOk = false;
    }

    if (!hashOk) {
      const passwordHash = await hashPassword(password);
      execute(`UPDATE "Admin" SET "passwordHash" = ? WHERE "email" = ?`, [
        passwordHash,
        email,
      ]);
    }

    return existing.id;
  } catch (error) {
    console.error("[auth] SQLite admin sync failed (non-fatal):", error);
    return email;
  }
}

/**
 * Env credentials are the Hostinger source of truth.
 * SQLite hash is synced on success and used as a fallback.
 * Never throws.
 */
export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): Promise<AuthSuccess | AuthFailure> {
  try {
    const email = String(emailInput || "")
      .trim()
      .toLowerCase();
    const password = String(passwordInput || "").trim();

    if (!email || !password) {
      return { ok: false, error: "Email et mot de passe requis" };
    }

    let expectedEmail = "admin@aqf.ma";
    let expectedPassword = "Admin@AQF2026";

    try {
      const creds = getAdminCredentials();
      expectedEmail = creds.email;
      expectedPassword = creds.password;
    } catch (error) {
      console.error("[auth] credentials env read failed:", error);
    }

    const envMatch =
      safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);

    if (envMatch) {
      const adminId = await syncAdminRow(expectedEmail, expectedPassword);
      return { ok: true, email: expectedEmail, adminId };
    }

    try {
      await readyDb();
      const admin = queryOne<AdminRow>(
        `SELECT id, email, passwordHash FROM "Admin" WHERE email = ?`,
        [email]
      );
      if (admin?.passwordHash) {
        const valid = await verifyPassword(password, admin.passwordHash);
        if (valid) {
          return { ok: true, email: admin.email, adminId: admin.id };
        }
      }
    } catch (error) {
      console.error("[auth] SQLite password verify failed (non-fatal):", error);
    }

    return { ok: false, error: "Identifiants invalides" };
  } catch (error) {
    console.error("[auth] authenticateAdmin failed:", error);
    return { ok: false, error: "Authentification temporairement indisponible" };
  }
}
