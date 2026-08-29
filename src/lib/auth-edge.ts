import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (middleware + shared JWT).
 * Do NOT import next/headers or Node-only modules here.
 */

function getJwtSecretBytes(): Uint8Array {
  try {
    const secret =
      process.env.JWT_SECRET?.trim() || "dev-secret-change-in-production";

    if (!process.env.JWT_SECRET?.trim() && process.env.NODE_ENV === "production") {
      console.warn(
        "[auth] JWT_SECRET is not set in production — using an insecure fallback."
      );
    }

    return new TextEncoder().encode(secret);
  } catch (error) {
    console.error("[auth] getJwtSecretBytes failed:", error);
    return new TextEncoder().encode("dev-secret-change-in-production");
  }
}

export const COOKIE_NAME = "aqf_admin_token";
// Keep in sync with auth-constants (middleware must not import this file).
export { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";

const TOKEN_EXPIRY = "7d";

export interface AdminSession {
  adminId: string;
  email: string;
}

export async function createAdminToken(payload: AdminSession): Promise<string> {
  try {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(getJwtSecretBytes());
  } catch (error) {
    console.error("[auth] createAdminToken failed:", error);
    throw error;
  }
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    if (!token?.trim()) return null;
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    const adminId =
      typeof payload.adminId === "string" ? payload.adminId : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!adminId || !email) return null;
    return { adminId, email };
  } catch {
    return null;
  }
}
