import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = resolveDatabaseUrl();
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Always resolve to an absolute SQLite path before creating the client so
 * admin mutations and public SSR share the exact same database file.
 * Creation is wrapped so a transient FS error cannot take down the process.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (() => {
    try {
      const client = createPrismaClient();
      globalForPrisma.prisma = client;
      return client;
    } catch (error) {
      console.error(
        "[db] Prisma client init failed:",
        error instanceof Error ? error.message : error
      );
      // Last resort — still expose a client so imports don't explode.
      const client = new PrismaClient();
      globalForPrisma.prisma = client;
      return client;
    }
  })();

export function getResolvedDatabaseUrl(): string {
  return resolveDatabaseUrl();
}
