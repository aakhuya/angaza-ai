import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Landing page fetches API at runtime; don't fail the build if API is down.
  experimental: {},
};

export default nextConfig;
