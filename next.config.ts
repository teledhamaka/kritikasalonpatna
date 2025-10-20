import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Your existing config
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add this to fix the multiple lockfiles warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
