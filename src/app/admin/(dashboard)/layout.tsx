import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Node-only dashboard guard. Never throws a 500:
 * a missing/invalid cookie redirects to /admin/login.
 * redirect() is outside try/catch so Next.js navigation still works.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getAdminSession();
  } catch (error) {
    console.error("[admin] dashboard guard failed:", error);
    session = null;
  }

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
