/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  target: 'serverless',
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
