import {
  ensureDatabaseSchema,
  resetDatabaseSchemaCache,
} from "@/lib/bootstrap-db";
import { ensureDatabaseSeed, resetDatabaseSeedCache } from "@/lib/seed-runtime";

export function isPrismaSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? String(error.code) : "";
  const message =
    "message" in error ? String(error.message).toLowerCase() : String(error).toLowerCase();

  return (
    code === "P2021" ||
    code === "P1001" ||
    code === "P1003" ||
    message.includes("no such table") ||
    message.includes("does not exist") ||
    message.includes("unable to open the database file") ||
    message.includes("database file locked")
  );
}

function getPrismaCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return String(error.code);
}

function mapMutationError(
  error: unknown
): { status: number; error: string } {
  const code = getPrismaCode(error);

  if (code === "P2002") {
    return { status: 409, error: "Cette valeur existe déjà" };
  }

  if (code === "P2025") {
    return { status: 404, error: "Enregistrement introuvable" };
  }

  if (error instanceof Error && error.message && !code) {
    return { status: 400, error: error.message };
  }

  return { status: 500, error: "Erreur serveur" };
}

export async function withPrismaQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  await ensureDatabaseSchema();
  await ensureDatabaseSeed();

  try {
    return await query();
  } catch (error) {
    if (isPrismaSchemaError(error)) {
      resetDatabaseSchemaCache();
      resetDatabaseSeedCache();
      await ensureDatabaseSchema();
      await ensureDatabaseSeed();

      try {
        return await query();
      } catch (retryError) {
        console.error("[db] Query retry failed:", retryError);
        return fallback;
      }
    }

    console.error("[db] Query failed:", error);
    return fallback;
  }
}

export async function runPrismaMutation<T>(
  mutation: () => Promise<T>
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  await ensureDatabaseSchema();
  await ensureDatabaseSeed();

  try {
    return { ok: true, data: await mutation() };
  } catch (error) {
    if (isPrismaSchemaError(error)) {
      resetDatabaseSchemaCache();
      resetDatabaseSeedCache();
      await ensureDatabaseSchema();
      await ensureDatabaseSeed();

      try {
        return { ok: true, data: await mutation() };
      } catch (retryError) {
        console.error("[db] Mutation retry failed:", retryError);
        return {
          ok: false,
          ...mapMutationError(retryError),
        };
      }
    }

    console.error("[db] Mutation failed:", error);
    return {
      ok: false,
      ...mapMutationError(error),
    };
  }
}
