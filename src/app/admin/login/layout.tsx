/**
 * Isolated login layout — no force-dynamic, no Prisma, no auth, no UI kit.
 * Parent admin layout is also kept inert for this segment.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
