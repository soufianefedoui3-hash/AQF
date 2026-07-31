import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export interface EnsureAdminResult {
  email: string;
  created: boolean;
  reset: boolean;
  message: string;
}

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "admin@aqf.ma").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Admin@AQF2026",
  };
}

/**
 * Creates the admin account if missing. Password is updated only when forceReset is true.
 */
export async function ensureAdminAccount(
  forceReset = false
): Promise<EnsureAdminResult> {
  const { email, password } = getAdminCredentials();
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing && !forceReset) {
    return {
      email,
      created: false,
      reset: false,
      message: "Admin account already exists",
    };
  }

  const passwordHash = await hashPassword(password);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  return {
    email,
    created: !existing,
    reset: !!existing && forceReset,
    message: existing ? "Admin password reset" : "Admin account created",
  };
}
