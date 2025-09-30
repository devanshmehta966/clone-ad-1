/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Restrict file tracing to the workspace root to avoid incorrect root inference
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
  outputFileTracingRoot: path.join(__dirname, '../'),

  // Server external packages
  serverExternalPackages: ['@prisma/client', 'prisma', 'argon2'],

  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth
      'platform-lookaside.fbsbx.com', // Facebook OAuth
      'media.licdn.com', // LinkedIn OAuth
      'avatars.githubusercontent.com', // GitHub OAuth (if added)
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'],
          }
        : false,
  },
}

module.exports = nextConfig
