import { PrismaClient } from "@prisma/client";
import { resolveProductionDatabaseUrl } from "@/lib/database-url";

function getDatabaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return resolveProductionDatabaseUrl();
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

export function getResolvedDatabaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return resolveProductionDatabaseUrl();
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}
