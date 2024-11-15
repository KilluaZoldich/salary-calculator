/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/salary-calculator',
  assetPrefix: '/salary-calculator'
}

module.exports = nextConfig
