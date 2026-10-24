import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ የምስል ፈቃድ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // ✅ የ Next.js 16 አዲስ ባህሪያት
  cacheComponents: true,
  partialPrefetching: true,
  
  // ✅ የ Tailwind CSS v4 ማሽከርከሪያ (Turbopack)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;