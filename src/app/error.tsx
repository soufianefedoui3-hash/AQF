"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function RootError({
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
        Impossible d&apos;afficher cette page pour le moment. Veuillez réessayer.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button href="/" variant="outline">
          Accueil
        </Button>
      </div>
    </div>
  );
}
