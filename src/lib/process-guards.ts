/**
 * Install once per Node process. Hostinger's process manager often double-starts
 * `next start` and then calls close() on a server that never bound — that throws
 * ERR_SERVER_NOT_RUNNING and used to crash the app into a restart storm.
 */

const GUARD_FLAG = Symbol.for("aqf.processGuardsInstalled");

function isBenignNetError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return /Server is not running/i.test(String(error ?? ""));
  }

  const err = error as { code?: string; message?: string };
  return (
    err.code === "ERR_SERVER_NOT_RUNNING" ||
    /Server is not running/i.test(err.message || "")
  );
}

export function installProcessGuards(): void {
  const g = globalThis as typeof globalThis & {
    [GUARD_FLAG]?: boolean;
  };

  if (g[GUARD_FLAG]) return;
  g[GUARD_FLAG] = true;

  process.on("uncaughtException", (error) => {
    if (isBenignNetError(error)) {
      console.warn(
        "[process] Ignored benign net error (Hostinger close race):",
        error instanceof Error ? error.message : error
      );
      return;
    }

    console.error("[process] uncaughtException:", error);
    // Keep previous fatal behavior for real bugs.
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    if (isBenignNetError(reason)) {
      console.warn(
        "[process] Ignored benign rejection (Hostinger close race):",
        reason instanceof Error ? reason.message : reason
      );
      return;
    }

    console.error("[process] unhandledRejection:", reason);
  });

  console.log("[process] Hostinger net close guards installed.");
}
