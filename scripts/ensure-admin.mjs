import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getAdminCredentials() {
  return {
    email: stripQuotes(process.env.ADMIN_EMAIL || "admin@aqf.ma").toLowerCase(),
    password: stripQuotes(process.env.ADMIN_PASSWORD || "Admin@AQF2026"),
  };
}

/**
 * Creates, resets, or repairs the admin account in SQLite.
 */
export async function ensureAdmin(prisma, { forceReset = false } = {}) {
  const { email, password } = getAdminCredentials();
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({ data: { email, passwordHash } });
    return {
      email,
      created: true,
      reset: false,
      repaired: false,
      verified: false,
      message: "Admin account created",
    };
  }

  if (!forceReset) {
    try {
      const valid = await bcrypt.compare(password, existing.passwordHash);
      if (valid) {
        return {
          email,
          created: false,
          reset: false,
          repaired: false,
          verified: true,
          message: "Admin credentials verified",
        };
      }
    } catch {
      /* repair below */
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.update({
    where: { email },
    data: { passwordHash },
  });

  return {
    email,
    created: false,
    reset: forceReset,
    repaired: !forceReset,
    verified: false,
    message: forceReset ? "Admin password reset" : "Admin password repaired",
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
