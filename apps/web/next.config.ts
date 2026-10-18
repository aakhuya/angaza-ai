import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${target}/:path*` },
      // Avatar uploads live on the API server. Proxy them through Next so
      // <img src="/uploads/..."> in the browser reaches the file.
      { source: "/uploads/:path*", destination: `${target}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
