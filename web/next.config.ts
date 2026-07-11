import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
}

const NEXT_DIST_DIR = process.env.NEXT_DIST_DIR

if (NEXT_DIST_DIR) {
  nextConfig.distDir = NEXT_DIST_DIR
}

export default nextConfig
