export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
