"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-surface font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-primary-900">Erreur serveur</h1>
          <p className="mt-3 max-w-md text-text-muted">
            L&apos;application a rencontré un problème inattendu.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Réessayer</Button>
            <Link href="/">
              <Button variant="outline">Accueil</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
