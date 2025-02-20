import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // builds it as a static website
  distDir: "dist",
  reactStrictMode: false,
};

export default nextConfig;
