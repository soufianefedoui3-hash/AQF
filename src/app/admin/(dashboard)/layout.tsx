import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
