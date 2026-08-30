/** @type {import('next').NextConfig} */

const NO_STORE = [
  { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate, max-age=0" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Surrogate-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
];

const IMMUTABLE_STATIC = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
  { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
];

const SHORT_CSS = [
  { key: "Cache-Control", value: "public, max-age=60, must-revalidate" },
  { key: "CDN-Cache-Control", value: "public, max-age=60, must-revalidate" },
];

const nextConfig = {
  // Standard Next.js — no standalone, no basePath, no assetPrefix, no custom server.
  // Hostinger: bind via `next start -H 0.0.0.0` (see package.json).
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  serverExternalPackages: ["better-sqlite3", "node:sqlite"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      const extras = ["better-sqlite3", "node:sqlite"];
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, ...extras]
        : extras;
    }
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },

  async rewrites() {
    return {
      fallback: [
        {
          source: "/_next/static/css/:file",
          destination: "/api/assets/css",
        },
      ],
    };
  },

  images: {
    remotePatterns: [],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/brand/**" },
      { pathname: "/placeholders/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: IMMUTABLE_STATIC,
      },
      {
        source: "/brand/:path*",
        headers: IMMUTABLE_STATIC,
      },
      {
        source: "/placeholders/:path*",
        headers: IMMUTABLE_STATIC,
      },
      {
        source: "/styles/:path*",
        headers: SHORT_CSS,
      },
      {
        source: "/api/:path*",
        headers: NO_STORE,
      },
      {
        source: "/",
        headers: NO_STORE,
      },
      {
        source: "/:path((?!_next/static|_next/image|brand|placeholders|uploads|styles).*)",
        headers: NO_STORE,
      },
    ];
  },
};

export default nextConfig;
