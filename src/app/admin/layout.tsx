/**
 * Admin root layout — intentionally inert (no auth).
 * Dynamic rendering is set on the root and login layouts so CSS
 * hashes in <head> cannot be frozen by Hostinger CDN.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
