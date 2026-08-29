/**
 * Isolated login layout — no auth, no UI kit.
 * force-dynamic so Hostinger never caches a stale document
 * that points at deleted CSS hashes.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
