import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  createAdminToken,
  verifyAdminToken,
  type AdminSession,
} from "@/lib/auth-edge";

export {
  COOKIE_NAME,
  createAdminToken,
  verifyAdminToken,
  type AdminSession,
};

/** Server-only session helpers (Route Handlers / Server Components). */

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch (error) {
    console.error("[auth] getAdminSession failed:", error);
    return null;
  }
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
