/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    qualities: [75, 85],
    // ⚠ REMOVE this deprecated line:
    // domains: ['localhost'], 

    // ✅ ADD this new, secure configuration:
    remotePatterns: [
      {
        protocol: 'http', // Use 'http' for localhost during development
        hostname: 'localhost',
        // Next.js requires protocol and hostname
        // Optionally, you can add port: '3000' if you access it via localhost:3000
      },
    ],
    
    unoptimized: true, // For static export
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;