import type { NextConfig } from "next";

// Mount path. Piloting at cwcasting.com/pitchgen via a rewrite from the
// cwcasting project; set NEXT_PUBLIC_BASE_PATH="" once PitchGen has its own domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/pitchgen";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
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
