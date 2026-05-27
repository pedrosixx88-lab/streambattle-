import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@streambattle/shared-types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "p16-sign-sg.tiktokcdn.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
