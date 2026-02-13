/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v0.3/:path*",
        destination: `${API_URL}/api/v0.3/:path*`,
      },
      {
        source: "/api/v0.2/:path*",
        destination: `${API_URL}/api/v0.2/:path*`,
      },
    ];
  },
};

export default nextConfig;
