"use client";

import { useState } from "react";

/**
 * Pure client login form — no Prisma, cookies(), headers, layouts, or UI kit.
 * Mounted with ssr:false so Hostinger never server-renders this tree.
 */
export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      if (!email || !password) {
        setError("Email et mot de passe requis");
        return;
      }

      const payload = JSON.stringify({ email, password });
      const init: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      };

      let res: Response;
      try {
        res = await fetch("/api/admin/auth", init);
      } catch {
        try {
          res = await fetch("/api/auth/login", init);
        } catch {
          setError("Impossible de joindre le serveur. Réessayez.");
          return;
        }
      }

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(
          typeof data.error === "string" && data.error.trim()
            ? data.error
            : "Identifiants invalides"
        );
        return;
      }

      // Full navigation avoids Next router/session edge cases after login.
      window.location.assign("/admin");
    } catch {
      setError("Identifiants invalides ou service temporairement indisponible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background:
          "linear-gradient(135deg, #004d5a 0%, #0a6b7c 50%, #22c8e8 100%)",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/aqf-logo.png"
            alt="AQF"
            width={140}
            height={56}
            style={{
              display: "block",
              margin: "0 auto",
              maxWidth: "9.5rem",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <h1
            style={{
              marginTop: 20,
              fontSize: 22,
              fontWeight: 700,
              color: "#0a3340",
            }}
          >
            Administration AQF
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#5a7178" }}>
            Connexion administrateur
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          {error ? (
            <div
              role="alert"
              style={{
                borderRadius: 10,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : null}

          <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#0a3340" }}>
            <span style={{ fontWeight: 600 }}>
              Email administrateur <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              defaultValue="admin@aqf.ma"
              disabled={loading}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #cfe3e8",
                padding: "12px 14px",
                fontSize: 15,
                color: "#0a3340",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#0a3340" }}>
            <span style={{ fontWeight: 600 }}>
              Mot de passe <span style={{ color: "#ef4444" }}>*</span>
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #cfe3e8",
                padding: "12px 14px",
                fontSize: 15,
                color: "#0a3340",
                boxSizing: "border-box",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              width: "100%",
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              background: "linear-gradient(90deg, #22c8e8, #7ec8a8)",
              color: "#004d5a",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
