import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "admin@aqf.ma").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Admin@AQF2026",
  };
}

/**
 * Ensures the admin account exists in the database.
 * - Creates the admin if missing.
 * - Updates the password only when `forceReset` is true.
 */
export async function ensureAdmin(prisma, { forceReset = false } = {}) {
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

  const passwordHash = await bcrypt.hash(password, 12);

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

export async function runEnsureAdmin(options = {}) {
  const prisma = new PrismaClient();

  try {
    return await ensureAdmin(prisma, options);
  } finally {
    await prisma.$disconnect();
  }
}
