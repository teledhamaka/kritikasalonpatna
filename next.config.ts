import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        pathname: '/tr/**', // Matches the Facebook Pixel tracking path
      },
    ],
  },
  /* config options here */
  
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add this to fix the multiple lockfiles warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
