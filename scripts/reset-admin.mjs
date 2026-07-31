import { runEnsureAdmin } from "./ensure-admin.mjs";

runEnsureAdmin({ forceReset: true })
  .then((result) => {
    console.log("Admin account ready:");
    console.log(`  Email:    ${result.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || "Admin@AQF2026"}`);
    console.log("");
    console.log("Change ADMIN_PASSWORD in your environment after first login.");
  })
  .catch((error) => {
    console.error("Failed to reset admin:", error.message);
    process.exit(1);
  });
