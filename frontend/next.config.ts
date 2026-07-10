import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autossuficiente para rodar sob PM2 na VPS (sem dependências da Vercel).
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
