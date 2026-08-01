import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./ensure-db.mjs";

function log(message) {
  console.log(`[seed-db] ${message}`);
}

function error(message) {
  console.error(`[seed-db] ${message}`);
}

async function main() {
  if (process.env.SKIP_DB_SEED === "true") {
    log("SKIP_DB_SEED=true — skipping seed.");
    process.exit(0);
  }

  const databaseUrl = resolveDatabaseUrl();
  log(`Using database: ${databaseUrl}`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    const settingsCount = await prisma.siteSettings.count();
    if (settingsCount > 0) {
      log("Database already seeded — skipping.");
      process.exit(0);
    }
  } catch (countError) {
    error(`Could not inspect database: ${countError.message}`);
  } finally {
    await prisma.$disconnect();
  }

  const tsxEntry = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  const seedFile = join(process.cwd(), "prisma", "seed.ts");

  if (!existsSync(tsxEntry)) {
    error("tsx not found. Run npm install before seeding.");
    process.exit(1);
  }

  log("Running prisma/seed.ts ...");

  const result = spawnSync(process.execPath, [tsxEntry, seedFile], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });

  if (result.error) {
    error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main().catch((err) => {
  error(err.message);
  process.exit(1);
});
