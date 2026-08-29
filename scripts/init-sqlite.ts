import { readyDb, resolveSqlitePath } from "../src/lib/db";

async function main() {
  const path = resolveSqlitePath();
  const ok = await readyDb();
  if (!ok) {
    console.error("[db] Init failed for", path);
    process.exitCode = 1;
    return;
  }
  console.log("[db] Ready at", path);
}

main().catch((error) => {
  console.error("[db] Init crashed:", error);
  process.exitCode = 1;
});
