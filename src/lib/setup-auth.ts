import { NextRequest } from "next/server";

export function isSetupAuthorized(request: NextRequest): boolean {
  const secret =
    process.env.SETUP_SECRET?.trim() || process.env.FIX_ADMIN_SECRET?.trim();

  if (!secret) return false;

  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (bearer && bearer === secret) return true;

  const headerKey = request.headers.get("x-setup-secret")?.trim();
  return headerKey === secret;
}

export function getSetupSecretConfigured(): boolean {
  return Boolean(
    process.env.SETUP_SECRET?.trim() || process.env.FIX_ADMIN_SECRET?.trim()
  );
}
