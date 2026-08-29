/**
 * Compatibility shim — sessions are Node HMAC cookies now.
 * Do not import this file from Edge middleware.
 */
export {
  COOKIE_NAME,
  createAdminToken,
  verifyAdminToken,
  type AdminSession,
} from "@/lib/auth/session";
export { ADMIN_COOKIE_NAME } from "@/lib/auth-constants";
