/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/salary-calculator',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
