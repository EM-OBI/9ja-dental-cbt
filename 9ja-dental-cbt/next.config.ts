import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext Cloudflare handles dynamic routes
  // Don't use output: "export" for Workers deployment

  // Disable standalone to avoid Windows symlink issues
  output: undefined,

  // Force dynamic rendering to avoid prerendering issues
  experimental: {
    forceSwcTransforms: true,
  },

  images: {
    // Disable Next.js image optimization for Cloudflare Workers
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
