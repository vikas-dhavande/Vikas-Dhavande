/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export is only used for GitHub Pages. 
  // For Vercel/Production, we use the standard build.
  output: process.env.GITHUB_PAGES ? 'export' : undefined,
  basePath: process.env.GITHUB_PAGES ? '/Vikas-dhavande' : '',
  assetPrefix: process.env.GITHUB_PAGES ? '/Vikas-dhavande/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iurkjbpztqmxeczoaqjr.supabase.co',
        pathname: '/storage/v1/object/public/**',
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
