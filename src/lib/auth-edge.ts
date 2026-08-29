import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (middleware + shared JWT).
 * Do NOT import next/headers or Node-only modules here.
 */

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] JWT_SECRET is not set in production — using an insecure fallback."
    );
  }

  return "dev-secret-change-in-production";
}

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

export const COOKIE_NAME = "aqf_admin_token";
const TOKEN_EXPIRY = "7d";

export interface AdminSession {
  adminId: string;
  email: string;
}

export async function createAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    if (!token?.trim()) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId =
      typeof payload.adminId === "string" ? payload.adminId : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!adminId || !email) return null;
    return { adminId, email };
  } catch {
    return null;
  }
}
