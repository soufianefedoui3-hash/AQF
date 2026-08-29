import { unstable_noStore as noStore } from "next/cache";
import { ensureDatabaseSchema } from "@/lib/bootstrap-db";
import { ensureDatabaseSeed } from "@/lib/seed-runtime";

/**
 * Opt CMS reads out of the Next.js Full Route / Data Cache and ensure the
 * SQLite schema + image URL repairs run before querying.
 */
export async function liveCmsQuery<T>(query: () => Promise<T>): Promise<T> {
  noStore();
  await ensureDatabaseSchema();
  await ensureDatabaseSeed();
  return query();
}
