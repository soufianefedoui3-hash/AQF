import dynamic from "next/dynamic";

/**
 * Login route shell — NO 'use client' here so we can disable SSR.
 * The form is client-only (ssr:false) to prevent Hostinger 500s from
 * server-pre-rendering React on this path.
 */
const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #004d5a 0%, #0a6b7c 50%, #22c8e8 100%)",
        fontFamily: "system-ui, sans-serif",
        color: "#fff",
      }}
    >
      Chargement…
    </div>
  ),
});

export default function AdminLoginPage() {
  return <LoginForm />;
}
