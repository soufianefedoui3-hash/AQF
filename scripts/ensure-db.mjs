import { execSync } from "node:child_process";
import { runEnsureAdmin } from "./ensure-admin.mjs";

const isProduction = process.env.NODE_ENV === "production";

async function main() {
  console.log("[ensure-db] Starting database bootstrap...");

  if (!process.env.DATABASE_URL) {
    console.warn("[ensure-db] DATABASE_URL is not set. Using Prisma default from schema.");
  }

  try {
    console.log("[ensure-db] Running prisma db push (schema sync, no data wipe)...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    console.error("[ensure-db] prisma db push failed:", error.message);
    if (isProduction) {
      process.exit(1);
    }
    throw error;
  }

  const forceReset = process.env.ADMIN_FORCE_RESET === "true";
  const result = await runEnsureAdmin({ forceReset });

  console.log(`[ensure-db] ${result.message}: ${result.email}`);
  if (result.created) {
    console.log("[ensure-db] Default credentials apply from ADMIN_EMAIL / ADMIN_PASSWORD.");
  }
  if (forceReset) {
    console.log("[ensure-db] Admin password was reset from ADMIN_PASSWORD.");
  }
}

main().catch((error) => {
  console.error("[ensure-db] Bootstrap failed:", error.message);
  process.exit(1);
});
