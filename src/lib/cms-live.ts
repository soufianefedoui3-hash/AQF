import { unstable_noStore as noStore } from "next/cache";
import { readyDb } from "@/lib/db";

/**
 * Opt CMS reads out of Next.js caches and ensure SQLite is ready.
 * Never throws for bootstrap failures.
 */
export async function liveCmsQuery<T>(query: () => Promise<T>): Promise<T> {
  try {
    noStore();
  } catch {
    /* ignore when called outside a request context */
  }

  try {
    await readyDb();
  } catch (error) {
    console.error("[cms] readyDb failed:", error);
  }

  return query();
}

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
