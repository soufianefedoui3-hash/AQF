/**
 * Hostinger and similar panels sometimes store env values with wrapping quotes.
 * Never throw — login must keep working with safe defaults.
 */

export function normalizeEnvValue(
  value: string | undefined,
  fallback: string
): string {
  try {
    let normalized = (value ?? fallback).trim();

    if (
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
      normalized = normalized.slice(1, -1).trim();
    }

    return normalized || fallback;
  } catch {
    return fallback;
  }
}

export function getAdminCredentials(): { email: string; password: string } {
  try {
    return {
      email: normalizeEnvValue(process.env.ADMIN_EMAIL, "admin@aqf.ma").toLowerCase(),
      password: normalizeEnvValue(process.env.ADMIN_PASSWORD, "Admin@AQF2026"),
    };
  } catch (error) {
    console.error("[auth] getAdminCredentials failed:", error);
    return {
      email: "admin@aqf.ma",
      password: "Admin@AQF2026",
    };
  }
}

export function credentialsMatchEnv(email: string, password: string): boolean {
  try {
    const { email: envEmail, password: envPassword } = getAdminCredentials();
    return email === envEmail && password === envPassword;
  } catch {
    return false;
  }
}

/** Soft check used by login UI warnings — never throws. */
export function getAuthConfigStatus(): {
  ok: boolean;
  warning: string | null;
} {
  try {
    const hasJwt = Boolean(process.env.JWT_SECRET?.trim());
    if (!hasJwt && process.env.NODE_ENV === "production") {
      return {
        ok: true,
        warning:
          "JWT_SECRET n'est pas défini — connexion possible avec le secret de secours.",
      };
    }
    return { ok: true, warning: null };
  } catch {
    return { ok: true, warning: null };
  }
}
