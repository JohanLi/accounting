/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const NEXT_DIST_DIR = process.env.NEXT_DIST_DIR

if (NEXT_DIST_DIR) {
  nextConfig.distDir = NEXT_DIST_DIR
}

module.exports = nextConfig
