/**
 * Next.js instrumentation hook. Intentionally empty.
 * Do not install process listeners or close the HTTP server here —
 * Hostinger probes treat that as a crash.
 */
export async function register() {
  return;
}
