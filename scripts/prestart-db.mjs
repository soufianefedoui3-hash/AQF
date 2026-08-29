import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { resolveDatabaseUrl } from "./ensure-db.mjs";

/**
 * Hostinger prestart hook — intentionally tiny and silent.
 *
 * Full schema push + seed already run in `postbuild` (deploy-db.mjs).
 * Runtime also self-heals via `ensureDatabaseSeed` / `ensureDatabaseSchema`.
 *
 * Do NOT spawn Prisma CLI, open sockets, or call server.close() here:
 * delaying `next start` causes Hostinger's process manager to emit
 * `Error: Server is not running` when it tries to manage a port that
 * Next has not bound yet.
 */
try {
  if (process.env.SKIP_DB_BOOTSTRAP === "true") {
    process.exit(0);
  }

  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl.startsWith("file:")) {
    const rawPath = databaseUrl.replace(/^file:/, "");
    mkdirSync(dirname(rawPath), { recursive: true });
  }
} catch {
  /* never block next start */
}

process.exit(0);
