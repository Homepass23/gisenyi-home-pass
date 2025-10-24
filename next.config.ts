import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Enable image optimization
    domains: [
      "images.unsplash.com",
      "via.placeholder.com",
      "example.com",
      "pdwfuhqxwocwohoycpvn.supabase.co",
      // Add any other domains you're loading images from
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for next/image
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (in seconds)
    minimumCacheTTL: 60,
    // Accepts `https://example.com` for remote images or `https://example.com/my-image.jpg` for remote images that should be optimized
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'pdwfuhqxwocwohoycpvn.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Add more remote patterns as needed
    ],
  },
};

export default nextConfig;