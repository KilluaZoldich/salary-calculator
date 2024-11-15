/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/salary-calculator',
  assetPrefix: '/salary-calculator/',
  trailingSlash: true
}

module.exports = nextConfig
