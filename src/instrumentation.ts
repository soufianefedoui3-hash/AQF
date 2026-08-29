/**
 * Next.js instrumentation — runs once when the Node server boots.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const { installProcessGuards } = await import("@/lib/process-guards");
  installProcessGuards();
}
