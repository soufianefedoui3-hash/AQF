"use client";

import { useEffect } from "react";

export default function AdminSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 22, color: "#0a3340", margin: 0 }}>
        Administration temporairement indisponible
      </h1>
      <p style={{ marginTop: 12, maxWidth: 420, color: "#5a7178", fontSize: 14 }}>
        Une erreur est survenue. Réessayez ou reconnectez-vous.
      </p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            background: "#004d5a",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
        <a
          href="/admin/login"
          style={{
            borderRadius: 10,
            padding: "10px 18px",
            border: "2px solid #22c8e8",
            color: "#004d5a",
            textDecoration: "none",
          }}
        >
          Connexion
        </a>
      </div>
    </div>
  );
}
