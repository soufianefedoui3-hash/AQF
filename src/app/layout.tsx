import "@/app/globals.css";
import type { Metadata } from "next";
import { ClientToaster } from "@/components/ui/ClientToaster";

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
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased">
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
