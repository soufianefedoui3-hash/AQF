import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/bootstrap-db";
import {
  needsDefaultSeed,
  repairBrokenSectorImages,
  seedDefaultContent,
} from "@/lib/seed-database";

let seedInitPromise: Promise<boolean> | null = null;

export function resetDatabaseSeedCache(): void {
  seedInitPromise = null;
}

/**
 * Seeds default CMS content once when core tables are empty,
 * and always repairs legacy Unsplash image URLs.
 */
export async function ensureDatabaseSeed(): Promise<boolean> {
  if (process.env.SKIP_DB_SEED === "true") {
    return true;
  }

  if (!seedInitPromise) {
    seedInitPromise = (async () => {
      try {
        await ensureDatabaseSchema();

        const shouldSeed = await needsDefaultSeed(prisma);
        if (shouldSeed) {
          console.log("[db] Seeding default CMS content...");
          await seedDefaultContent(prisma, { includeAdmin: false });
          console.log("[db] Default CMS content seeded.");
        } else {
          const repaired = await repairBrokenSectorImages(prisma);
          if (repaired > 0) {
            console.log(`[db] Replaced ${repaired} broken external sector image URL(s).`);
          }
        }

        return true;
      } catch (error) {
        console.error(
          "[db] Seed failed:",
          error instanceof Error ? error.message : error
        );
        seedInitPromise = null;
        return false;
      }
    })();
  }

  return seedInitPromise;
}
