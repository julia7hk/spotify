import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5001/api/:path*",
      },
      {
        source: "/callback",
        destination: "http://127.0.0.1:5001/callback",
      },
      {
        source: "/logout",
        destination: "http://127.0.0.1:5001/logout",
      },
    ];
  },
};

export default nextConfig;
