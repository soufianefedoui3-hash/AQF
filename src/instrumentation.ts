export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SKIP_DB_BOOTSTRAP === "true") return;

  try {
    const { resolveProductionDatabaseUrl } = await import("@/lib/database-url");
    const { fixAdminAccount } = await import("@/lib/ensure-admin");

    resolveProductionDatabaseUrl();
    const result = await fixAdminAccount();

    console.log(
      `[instrumentation] Admin bootstrap: ${result.message} (${result.email})`
    );
  } catch (error) {
    console.error(
      "[instrumentation] Admin bootstrap failed:",
      error instanceof Error ? error.message : error
    );
  }
}
