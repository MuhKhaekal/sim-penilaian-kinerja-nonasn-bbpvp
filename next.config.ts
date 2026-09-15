import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Naikkan batas maksimal menjadi 5MB
    },
  },
};

export default nextConfig;
