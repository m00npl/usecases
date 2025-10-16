/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  images: { unoptimized: true },
  transpilePackages: ['golem-base-sdk'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('tslog')
    }
    return config
  }
}
export default nextConfig
