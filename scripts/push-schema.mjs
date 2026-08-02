import { resolveDatabaseUrl, runSchemaPush } from "./ensure-db.mjs";

function log(message) {
  console.log(`[push-schema] ${message}`);
}

async function main() {
  try {
    if (process.env.SKIP_DB_BOOTSTRAP === "true") {
      log("SKIP_DB_BOOTSTRAP=true — skipping schema push.");
      process.exit(0);
    }

    const databaseUrl = resolveDatabaseUrl();
    log(`Using database: ${databaseUrl}`);
    log("Ensuring schema (CLI or SQL fallback)...");

    const result = await runSchemaPush({ acceptDataLoss: true });
    log(`Schema push completed via ${result.method}.`);
    process.exit(0);
  } catch (error) {
    console.error(
      "[push-schema] Failed (non-fatal):",
      error instanceof Error ? error.message : error
    );
    // Never fail Hostinger build/start because schema sync failed.
    process.exit(0);
  }
}

main();
