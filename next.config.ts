import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
  async rewrites() {
    return [
      {
        source: "/ws/:path*",
        destination: "http://localhost:8080/ws/:path*", // backend local
      },
    ]
  },
}