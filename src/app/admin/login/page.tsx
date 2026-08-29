"use client";

/**
 * Client-only login page (Next.js 15: ssr:false is illegal in Server Components).
 * Hostinger still serves static public/admin-login.html via rewrite for zero SSR.
 */
export { default } from "./LoginForm";
