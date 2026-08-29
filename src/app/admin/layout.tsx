/**
 * Admin root layout — intentionally inert.
 * Do NOT set force-dynamic / nodejs here: that forced SSR of /admin/login
 * and contributed to Hostinger 500s. Dashboard layout opts in separately.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
