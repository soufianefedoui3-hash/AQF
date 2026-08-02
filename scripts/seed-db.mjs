import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./ensure-db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function log(message) {
  console.log(`[seed-db] ${message}`);
}

function warn(message) {
  console.warn(`[seed-db] ${message}`);
}

function error(message) {
  console.error(`[seed-db] ${message}`);
}

function resolveTsxEntry() {
  const candidates = [];

  try {
    const require = createRequire(join(process.cwd(), "package.json"));
    const tsxPackageJson = require.resolve("tsx/package.json");
    candidates.push(join(dirname(tsxPackageJson), "dist", "cli.mjs"));
  } catch {
    /* ignore */
  }

  candidates.push(
    join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
    join(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs")
  );

  return candidates.find((candidate) => existsSync(candidate)) || null;
}

async function main() {
  try {
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
      warn(`Could not inspect database yet: ${countError.message}`);
    } finally {
      await prisma.$disconnect();
    }

    const tsxEntry = resolveTsxEntry();
    const seedFile = join(process.cwd(), "prisma", "seed.ts");

    if (!tsxEntry) {
      warn("tsx not found — skipping seed (non-fatal).");
      process.exit(0);
    }

    if (!existsSync(seedFile)) {
      warn("prisma/seed.ts not found — skipping seed (non-fatal).");
      process.exit(0);
    }

    log("Running prisma/seed.ts ...");

    const result = spawnSync(process.execPath, [tsxEntry, seedFile], {
      stdio: "inherit",
      env: process.env,
      cwd: process.cwd(),
    });

    if (result.error) {
      warn(`Seed failed (non-fatal): ${result.error.message}`);
      process.exit(0);
    }

    if ((result.status ?? 0) !== 0) {
      warn(`Seed exited with code ${result.status} (non-fatal).`);
      process.exit(0);
    }

    log("Seed completed.");
    process.exit(0);
  } catch (err) {
    error(`Seed failed (non-fatal): ${err.message}`);
    process.exit(0);
  }
}

main();
