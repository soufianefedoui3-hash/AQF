/**
 * Hostinger and similar panels sometimes store env values with wrapping quotes.
 */
export function normalizeEnvValue(
  value: string | undefined,
  fallback: string
): string {
  let normalized = (value ?? fallback).trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

export function getAdminCredentials() {
  return {
    email: normalizeEnvValue(process.env.ADMIN_EMAIL, "admin@aqf.ma").toLowerCase(),
    password: normalizeEnvValue(process.env.ADMIN_PASSWORD, "Admin@AQF2026"),
  };
}

export function credentialsMatchEnv(email: string, password: string): boolean {
  const { email: envEmail, password: envPassword } = getAdminCredentials();
  return email === envEmail && password === envPassword;
}
