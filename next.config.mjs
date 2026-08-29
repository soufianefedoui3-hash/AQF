/** @type {import('next').NextConfig} */

const NO_STORE = [
  { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate, max-age=0" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Surrogate-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
];

const IMMUTABLE_STATIC = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
  {
    key: "CDN-Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const nextConfig = {
  // Hostinger Node.js: default asset URLs (/_next/static/...).
  // Do not set output:'standalone', basePath, or assetPrefix — those
  // break CSS/JS on shared hosting when the app is served at the domain root.
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  // Native / built-in SQLite drivers must stay outside the Next bundle.
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

  // Missing eslint on Hostinger production installs must not fail the build.
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
          destination: "/styles/aqf.css",
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
        // Content-hashed CSS/JS/fonts — safe to cache forever.
        // Must NOT inherit the HTML no-store policy (that breaks Hostinger/hCDN).
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
        headers: IMMUTABLE_STATIC,
      },
      {
        source: "/api/:path*",
        headers: NO_STORE,
      },
      {
        // HTML only — do not match /_next/static or public assets
        // (later matching sources overwrite earlier Cache-Control).
        source: "/",
        headers: NO_STORE,
      },
      {
        source:
          "/:path((?!_next/static|_next/image|brand|placeholders|uploads|styles).*)",
        headers: NO_STORE,
      },
    ];
  },
};

export default nextConfig;
