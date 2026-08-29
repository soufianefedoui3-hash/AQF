/**
 * Loaded via `node --import` before Next.js so Hostinger close-races
 * cannot crash the process before instrumentation runs.
 */
function isBenignNetError(error) {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || String(error);
  return (
    code === "ERR_SERVER_NOT_RUNNING" ||
    /Server is not running/i.test(message)
  );
}

if (!globalThis.__aqfGuardsInstalled) {
  globalThis.__aqfGuardsInstalled = true;

  process.on("uncaughtException", (error) => {
    if (isBenignNetError(error)) {
      console.warn(
        "[register-guards] Ignored benign net error:",
        error.message || error
      );
      return;
    }
    console.error("[register-guards] uncaughtException:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    if (isBenignNetError(reason)) {
      console.warn(
        "[register-guards] Ignored benign rejection:",
        reason && reason.message ? reason.message : reason
      );
      return;
    }
    console.error("[register-guards] unhandledRejection:", reason);
  });
}
