/**
 * Admin root layout — must stay crash-proof so /admin/login always renders.
 * Do not force nodejs runtime here (Hostinger Edge/Node quirks); dashboard
 * layout opts into nodejs where Prisma is needed.
 */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
