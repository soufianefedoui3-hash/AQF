import { unstable_noStore as noStore } from "next/cache";
import { ensureDatabaseSchema } from "@/lib/bootstrap-db";

/**
 * Opt CMS reads out of the Next.js Full Route / Data Cache and ensure the
 * SQLite schema exists before querying — so public pages always see the
 * latest admin saves.
 */
export async function liveCmsQuery<T>(query: () => Promise<T>): Promise<T> {
  noStore();
  await ensureDatabaseSchema();
  return query();
}
