import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const strict = process.argv.includes("--strict");

function log(message) {
  console.log(`[prisma-generate] ${message}`);
}

function warn(message) {
  console.warn(`[prisma-generate] ${message}`);
}

function fail(message) {
  console.error(`[prisma-generate] ${message}`);
  process.exit(strict ? 1 : 0);
}

function resolvePrismaCli() {
  const candidates = [];

  try {
    const require = createRequire(join(process.cwd(), "package.json"));
    const prismaPackageJson = require.resolve("prisma/package.json");
    candidates.push(join(dirname(prismaPackageJson), "build", "index.js"));
  } catch {
    /* ignore */
  }

  candidates.push(
    join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
    join(__dirname, "..", "node_modules", "prisma", "build", "index.js")
  );

  return candidates.find((candidate) => existsSync(candidate)) || null;
}

function main() {
  try {
    const prismaEntry = resolvePrismaCli();

    if (!prismaEntry) {
      fail("Prisma CLI not found. Run npm install.");
      return;
    }

    log(`Running prisma generate via ${prismaEntry}`);
    const result = spawnSync(process.execPath, [prismaEntry, "generate"], {
      stdio: "inherit",
      env: process.env,
      cwd: process.cwd(),
    });

    if (result.error) {
      fail(result.error.message);
      return;
    }

    if ((result.status ?? 0) !== 0) {
      fail(`prisma generate exited with code ${result.status}`);
      return;
    }

    log("Prisma client generated.");
    process.exit(0);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

main();
