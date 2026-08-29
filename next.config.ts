import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
