"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminError({
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-primary-900">Erreur dans l&apos;administration</h2>
      <p className="mt-3 max-w-md text-sm text-text-muted">
        Cette section n&apos;a pas pu être chargée. Réessayez ou reconnectez-vous.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="sm" onClick={reset}>
          Réessayer
        </Button>
        <Link href="/admin">
          <Button size="sm" variant="outline">
            Tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}
