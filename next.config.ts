import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / built-in SQLite drivers must stay outside the Next bundle.
  serverExternalPackages: ["better-sqlite3"],
  // Prevent accidental static optimization of CMS pages.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  images: {
    // Local uploads/placeholders/brand only — no remote image CDNs.
    remotePatterns: [],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/brand/**",
      },
      {
        pathname: "/placeholders/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Serve static HTML for login — bypasses Next SSR entirely on Hostinger.
      {
        source: "/admin/login",
        destination: "/admin-login.html",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
