/**
 * Admin client fetches — always send cookies, never cache, always time out
 * so Hostinger cannot leave the dashboard on an infinite spinner.
 */
export type AdminFetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

export async function adminFetch<T = unknown>(
  input: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<AdminFetchResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    if (res.status === 401 && typeof window !== "undefined") {
      window.location.assign("/admin/login");
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const error =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Erreur ${res.status}`;
      return { ok: false, error, status: res.status };
    }

    return { ok: true, data: data as T, status: res.status };
  } catch (error) {
    const aborted =
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError");
    return {
      ok: false,
      error: aborted
        ? "Délai dépassé — le serveur n'a pas répondu"
        : "Erreur de connexion",
      status: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}
