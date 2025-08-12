/** @type {import('next').NextConfig} */
const nextConfig = {
  // VERCEL-COMPATIBLE CONFIGURATION
  // Remove static export - Vercel needs server functionality
  
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  
  // Vercel-specific optimizations
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Keep essential security headers
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
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig