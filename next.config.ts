import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "stuffed-fifty-perjury.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "localhost:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization, ngrok-skip-browser-warning" },
        ],
      },
    ];
  },
};

export default nextConfig;
