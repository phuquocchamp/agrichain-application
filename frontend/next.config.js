/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: undefined,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Turbopack config for Next.js 16
  turbopack: {
    root: process.cwd(), // Set root to current directory to silence lockfile warning
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
