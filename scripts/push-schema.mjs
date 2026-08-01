import { resolveDatabaseUrl, runSchemaPush } from "./ensure-db.mjs";

function log(message) {
  console.log(`[push-schema] ${message}`);
}

function main() {
  try {
    if (process.env.SKIP_DB_BOOTSTRAP === "true") {
      log("SKIP_DB_BOOTSTRAP=true — skipping schema push.");
      process.exit(0);
    }

    const databaseUrl = resolveDatabaseUrl();
    log(`Using database: ${databaseUrl}`);
    log("Running prisma db push --accept-data-loss ...");

    runSchemaPush({ acceptDataLoss: true });
    log("Schema push completed.");
    process.exit(0);
  } catch (error) {
    console.error("[push-schema] Failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
