"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-gradient px-4 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-bold text-primary-900">Connexion indisponible</h1>
        <p className="mt-3 text-sm text-text-muted">
          La page de connexion a rencontré un problème. Réessayez.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Réessayer</Button>
          <Button href="/" variant="outline">
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
