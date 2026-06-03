import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow xlsx/papaparse to be processed in the browser bundle
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, stream: false };
    return config;
  },
};

export default nextConfig;
