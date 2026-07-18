import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Audius CDN — covers all discovery/creator nodes (*.audius.co)
      { protocol: 'https', hostname: '**.audius.co' },
    ],
  },
}

export default nextConfig
