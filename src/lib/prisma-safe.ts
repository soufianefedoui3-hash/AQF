import {
  ensureDatabaseSchema,
  resetDatabaseSchemaCache,
} from "@/lib/bootstrap-db";

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

export async function withPrismaQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  await ensureDatabaseSchema();

  try {
    return await query();
  } catch (error) {
    if (isPrismaSchemaError(error)) {
      resetDatabaseSchemaCache();
      await ensureDatabaseSchema();

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

  try {
    return { ok: true, data: await mutation() };
  } catch (error) {
    if (isPrismaSchemaError(error)) {
      resetDatabaseSchemaCache();
      await ensureDatabaseSchema();

      try {
        return { ok: true, data: await mutation() };
      } catch (retryError) {
        console.error("[db] Mutation retry failed:", retryError);
        return {
          ok: false,
          status: 503,
          error: "Base de données indisponible",
        };
      }
    }

    console.error("[db] Mutation failed:", error);
    return {
      ok: false,
      status: 500,
      error: "Erreur serveur",
    };
  }
}
