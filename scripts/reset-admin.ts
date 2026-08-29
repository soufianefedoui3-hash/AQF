import { fixAdminAccount } from "../src/lib/ensure-admin";

async function main() {
  const result = await fixAdminAccount({ force: true });
  console.log("Admin account ready:");
  console.log(`  Email:    ${result.email}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD || "Admin@AQF2026"}`);
  console.log(`  ${result.message}`);
}

main().catch((error) => {
  console.error(
    "Failed to reset admin:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
