import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";
import { normalizeEnvValue } from "@/lib/env-credentials";

export const COOKIE_NAME = ADMIN_COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface AdminSession {
  adminId: string;
  email: string;
}

type TokenPayload = AdminSession & { exp: number };

function getSessionSecret(): string {
  try {
    const secret = normalizeEnvValue(process.env.JWT_SECRET, "");
    if (secret) return secret;
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[auth] JWT_SECRET is not set — using a local fallback. Set JWT_SECRET in hPanel."
      );
    }
    return "dev-secret-change-in-production";
  } catch {
    return "dev-secret-change-in-production";
  }
}

function toBase64Url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function signBody(body: string): string {
  return createHmac("sha256", getSessionSecret()).update(body).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    const a = Buffer.from(String(left || ""), "utf8");
    const b = Buffer.from(String(right || ""), "utf8");
    if (a.length !== b.length || a.length === 0) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createAdminToken(session: AdminSession): string {
  try {
    const payload: TokenPayload = {
      adminId: session.adminId,
      email: session.email,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    };
    const body = toBase64Url(JSON.stringify(payload));
    return `${body}.${signBody(body)}`;
  } catch (error) {
    console.error("[auth] createAdminToken failed:", error);
    throw error;
  }
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    if (!token?.trim() || !token.includes(".")) return null;
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;
    if (!safeEqualHex(signature, signBody(body))) return null;

    const parsed = JSON.parse(fromBase64Url(body).toString("utf8")) as Partial<TokenPayload>;
    if (
      typeof parsed.adminId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (parsed.exp <= Date.now()) return null;
    return { adminId: parsed.adminId, email: parsed.email };
  } catch {
    return null;
  }
}

export function shouldUseSecureCookie(request?: NextRequest): boolean {
  try {
    if (process.env.COOKIE_SECURE === "true") return true;
    if (process.env.COOKIE_SECURE === "false") return false;
    if (request) {
      const forwarded = request.headers.get("x-forwarded-proto");
      if (forwarded) {
        return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
      }
      return request.nextUrl.protocol === "https:";
    }
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}

export function applyAdminCookie(
  response: NextResponse,
  token: string,
  request?: NextRequest
): void {
  try {
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  } catch (error) {
    console.error("[auth] cookie set failed:", error);
  }
}

export function clearAdminCookieOnResponse(
  response: NextResponse,
  request?: NextRequest
): void {
  try {
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {
    /* ignore */
  }
}

export function sessionFromRequest(request: NextRequest): AdminSession | null {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch (error) {
    console.error("[auth] sessionFromRequest failed:", error);
    return null;
  }
}

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
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: shouldUseSecureCookie(),
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  } catch (error) {
    console.error("[auth] setAdminCookie failed:", error);
  }
}

export async function clearAdminCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error("[auth] clearAdminCookie failed:", error);
  }
}
