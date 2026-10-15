/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable source maps in production to reduce peak memory consumption on low-memory servers
  productionBrowserSourceMaps: false,
  typescript: {
    // Skip in-process typecheck during Next.js bundling to prevent OOM on CI/Vercel (checked via npx tsc)
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint also runs a separate heavy process — skip during build, run locally instead
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sfo.cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
