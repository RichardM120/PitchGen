import type { NextConfig } from "next";

// PitchGen is served at cwcasting.com/pitchgen via a rewrite from the
// cwcasting Vercel project, so every route lives under this base path.
const nextConfig: NextConfig = {
  basePath: "/pitchgen",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
