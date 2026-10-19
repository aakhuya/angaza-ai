import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${target}/:path*` },
    ];
  },
};

export default nextConfig;
