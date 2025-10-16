/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  images: { unoptimized: true },
  transpilePackages: ['arkiv-sdk'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('tslog')
    }
    return config
  }
}
export default nextConfig
