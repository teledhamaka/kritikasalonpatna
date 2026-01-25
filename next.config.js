/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete 
    // even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Enable SWC minification (faster than Terser)
  // swcMinify: true,


  images: {
    // ⚠ REMOVE this deprecated line:
    // domains: ['localhost'], 
    qualities: [25, 50, 75, 90],

    // ✅ ADD this new, secure configuration:
    remotePatterns: [
      {
        protocol: 'http', // Use 'http' for localhost during development
        hostname: 'googleusercontent.com',
        // Next.js requires protocol and hostname
        // Optionally, you can add port: '3000' if you access it via localhost:3000
      },
    ],
    
    unoptimized: true, // For static export
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    domains: [
      'kritikasalonpatna.com',
      'www.kritikasalonpatna.com',
      'images.unsplash.com', // If using Unsplash
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  //Compression
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Production source maps (disable for faster builds)
  productionBrowserSourceMaps: false,

  // Optimize CSS
  // optimizeFonts: true,

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.{js,css,woff,woff2,ttf,otf}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Rewrites for SEO-friendly URLs
  async rewrites() {
    return [
      // Service + Location combo pages
      {
        source: '/:service(bridal-makeup|hair-spa|facial|nail-art)-near-:location',
        destination: '/location/:location?service=:service',
      },
      // Location pages
      {
        source: '/location/:slug',
        destination: '/location/[slug]',
      },
    ]
  },

  // Redirects for old URLs
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.kritikasalonpatna.com',
          },
        ],
        destination: 'https://kritikasalonpatna.com/:path*',
        permanent: true,
      },
      // Old service URLs
      {
        source: '/services/:slug',
        destination: '/service/:slug',
        permanent: true,
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1]
                return `npm.${packageName?.replace('@', '')}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: 'shared',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }

    return config
  },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },

  // Environment variables (add your actual values)
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://kritikasalonpatna.com',
    NEXT_PUBLIC_PHONE: '+919650461390',
  },

};

module.exports = nextConfig;