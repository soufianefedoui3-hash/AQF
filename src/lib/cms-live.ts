import { unstable_noStore as noStore } from "next/cache";
import { ensureDatabaseSchema } from "@/lib/bootstrap-db";
import { ensureDatabaseSeed } from "@/lib/seed-runtime";

/**
 * Opt CMS reads out of Next.js caches and best-effort ensure schema/seed.
 * Never throws for bootstrap failures — callers still get query errors
 * which should be caught via safeCmsQuery.
 */
export async function liveCmsQuery<T>(query: () => Promise<T>): Promise<T> {
  try {
    noStore();
  } catch {
    /* ignore when called outside a request context */
  }

  try {
    await ensureDatabaseSchema();
  } catch (error) {
    console.error("[cms] schema ensure failed:", error);
  }

  try {
    await ensureDatabaseSeed();
  } catch (error) {
    console.error("[cms] seed ensure failed:", error);
  }

  return query();
}

/**
 * Same as liveCmsQuery but never throws — returns fallback on any failure.
 */
export async function safeCmsQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await liveCmsQuery(query);
  } catch (error) {
    console.error("[cms] query failed, using fallback:", error);
    return fallback;
  }
}
