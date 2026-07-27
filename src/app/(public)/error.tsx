"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PublicError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-primary-900">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-text-muted">
        Impossible d&apos;afficher cette page pour le moment. Veuillez réessayer ou revenir à
        l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
