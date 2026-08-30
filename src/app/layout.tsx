import "@/app/globals.css";
import type { Metadata } from "next";
import ClientToasterWrapper from "@/components/ClientToasterWrapper";

/** Never prerender the document shell with a year-long CDN cache. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "AQF | Académie de Qualité et de Formation",
  description:
    "Votre partenaire d'excellence en Qualité, Formation et Audit pour laboratoires, agroalimentaire, universités, cliniques et pharma.",
  icons: {
    icon: "/brand/aqf-logo.png",
    apple: "/brand/aqf-logo.png",
  },
};

/**
 * Root layout intentionally avoids next/font/google — remote font fetches
 * can crash every page with 500s on restricted Hostinger networks.
 * Toaster is mounted via a Client Component wrapper (no ssr:false in this file).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Stable path — Hostinger/LiteSpeed can serve this when a hashed /_next/static/css/*.css 404s */}
        <link rel="stylesheet" href="/styles/aqf.css" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ClientToasterWrapper />
      </body>
    </html>
  );
}
