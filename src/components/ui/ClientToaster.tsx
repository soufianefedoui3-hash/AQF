"use client";

import { Toaster } from "react-hot-toast";

/**
 * Isolated client Toaster so a toast SSR glitch cannot take down
 * the root layout (and thus /admin/login).
 */
export function ClientToaster() {
  try {
    return (
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
    );
  } catch (error) {
    console.error("[toaster] failed to render:", error);
    return null;
  }
}
