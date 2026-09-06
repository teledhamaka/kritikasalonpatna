import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Your existing config
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  async rewrites() {
    return [
      {
        source: "/near-bhootnath-metro/:slug",
        destination: "/bhootnath-road/:slug?from=metro",
      },
      {
        source: "/near-nmch/:slug",
        destination: "/bhootnath-road/:slug?from=nmch",
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add this to fix the multiple lockfiles warning
  turbopack: {
    root: __dirname,
    resolveAlias: {
        // not a direct fix, but can help
      },
  },
};

export default nextConfig;
