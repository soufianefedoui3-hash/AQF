"use client";

import { useEffect } from "react";

/**
 * Login-segment error UI — pure inline styles, no shared UI imports,
 * so a broken design-system module cannot blank the recovery screen.
 */
export default function AdminLoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/login]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(135deg, #004d5a 0%, #0a6b7c 50%, #22c8e8 100%)",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          background: "#fff",
          padding: 32,
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0a3340", margin: 0 }}>
          Connexion indisponible
        </h1>
        <p style={{ marginTop: 12, fontSize: 14, color: "#5a7178" }}>
          La page de connexion a rencontré un problème. Réessayez.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
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
              fontWeight: 600,
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
              fontWeight: 600,
            }}
          >
            Recharger
          </a>
        </div>
      </div>
    </div>
  );
}
