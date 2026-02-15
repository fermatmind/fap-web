/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

const nextConfig = {
  output: "standalone",
  async headers() {
    const value = "noindex, nofollow, noarchive";
    return [
      {
        source: "/result/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/zh/result/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/orders/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/zh/orders/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/share/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/zh/share/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
    ];
  },
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
