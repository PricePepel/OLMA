/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com'
    ]
  },
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
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  experimental: {
    outputFileTracingRoot: undefined,
  }
}

module.exports = nextConfig
