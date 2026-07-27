import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AQF | Académie de Qualité et de Formation",
  description:
    "Votre partenaire d'excellence en Qualité, Formation et Audit pour laboratoires, agroalimentaire, universités, cliniques et pharma.",
  icons: {
    icon: "/brand/aqf-logo.png",
    apple: "/brand/aqf-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#004d5a",
              color: "#f7f9fa",
              borderRadius: "12px",
              padding: "16px",
            },
            success: {
              iconTheme: { primary: "#7ec8a8", secondary: "#004d5a" },
            },
          }}
        />
      </body>
    </html>
  );
}
