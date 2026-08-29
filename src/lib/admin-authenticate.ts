import { timingSafeEqual } from "node:crypto";
import { getAdminCredentials } from "@/lib/env-credentials";
import { verifyPassword, hashPassword } from "@/lib/password";

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

/**
 * Bulletproof admin authentication:
 * 1) Prefer env ADMIN_EMAIL / ADMIN_PASSWORD (source of truth on Hostinger)
 * 2) On env match, best-effort sync bcrypt hash into SQLite Admin table
 * 3) If env fails, try DB passwordHash via bcrypt (never throws)
 * 4) Never throws — always returns a structured result
 */
export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): Promise<AuthSuccess | AuthFailure> {
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
    let adminId = expectedEmail;
    try {
      const { prisma } = await import("@/lib/prisma");
      const passwordHash = await hashPassword(expectedPassword);
      const existing = await prisma.admin.findUnique({
        where: { email: expectedEmail },
      });

      if (!existing) {
        const created = await prisma.admin.create({
          data: { email: expectedEmail, passwordHash },
        });
        adminId = created.id;
      } else {
        // Keep stored hash aligned with ADMIN_PASSWORD.
        let hashOk = false;
        try {
          hashOk = await verifyPassword(expectedPassword, existing.passwordHash);
        } catch {
          hashOk = false;
        }
        if (!hashOk) {
          await prisma.admin.update({
            where: { email: expectedEmail },
            data: { passwordHash },
          });
        }
        adminId = existing.id;
      }
    } catch (dbError) {
      // DB optional — env match is enough to issue a session.
      console.error("[auth] DB sync after env login failed (non-fatal):", dbError);
    }

    return { ok: true, email: expectedEmail, adminId };
  }

  // Secondary path: verify against hashed password in SQLite.
  try {
    const { prisma } = await import("@/lib/prisma");
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin?.passwordHash) {
      const valid = await verifyPassword(password, admin.passwordHash);
      if (valid) {
        return { ok: true, email: admin.email, adminId: admin.id };
      }
    }
  } catch (dbError) {
    console.error("[auth] DB password verify failed (non-fatal):", dbError);
  }

  return { ok: false, error: "Identifiants invalides" };
}
