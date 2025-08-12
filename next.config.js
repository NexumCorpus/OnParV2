/** @type {import('next').NextConfig} */
const nextConfig = {
  // VERCEL DEPLOYMENT CONFIGURATION
  // Removed 'output: export' for server functionality
  
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  
  // Vercel-optimized settings
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'stripe']
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Security headers (simplified for Vercel)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Essential redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig