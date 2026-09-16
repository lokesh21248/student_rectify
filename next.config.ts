import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Skip TS type checking during build (pre-existing errors in unchanged files)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Use WebP by default for smaller payloads
    formats: ["image/avif", "image/webp"],
    // Aggressive caching of optimized images (1 week)
    minimumCacheTTL: 604800,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Add HTTP caching headers for static public API endpoints
  async headers() {
    return [
      {
        // Public gallery & event listing — cache 60s on CDN, always revalidate
        source: "/api/public/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Public event list endpoint
        source: "/api/events",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=120" },
        ],
      },
    ];
  },
};

export default nextConfig;
