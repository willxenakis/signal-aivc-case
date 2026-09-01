import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["192.168.1.46"],
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
