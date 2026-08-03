"use client";

/**
 * Shared helper for public form fetch error toasts.
 */
export async function getFetchErrorMessage(
  res: Response,
  fallback = "Une erreur est survenue. Veuillez réessayer."
): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}
