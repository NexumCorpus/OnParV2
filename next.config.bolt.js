/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified config for bolt.new compatibility
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Remove complex webpack config that might break bolt.new
  experimental: {
    // Keep only essential experimental features
  },
  // Remove static export for bolt.new (it needs server functionality)
  // output: 'export', // REMOVE THIS LINE
  
  // Keep essential optimizations
  poweredByHeader: false,
  compress: true,
  
  // Simplified headers for bolt.new
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig