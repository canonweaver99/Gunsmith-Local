/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return []
  },
  async redirects() {
    return []
  },
  poweredByHeader: false,
  reactStrictMode: false,
}

module.exports = nextConfig
