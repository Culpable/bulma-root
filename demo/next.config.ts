import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '', // Leave empty for custom domain, or use '/repo-name' for github.io
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Recommended for GitHub Pages
}

export default nextConfig
