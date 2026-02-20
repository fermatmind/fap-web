/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";
const isProd = process.env.NODE_ENV === "production";
const cdnUrl = (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "");

function parseHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

const cdnHostname = parseHostname(cdnUrl);
const remotePatternHostnames = [...new Set(["**.fermatmind.com", "**.myqcloud.com", cdnHostname].filter(Boolean))];

const nextConfig = {
  output: "standalone",
  assetPrefix: isProd && cdnUrl ? cdnUrl : undefined,
  images: {
    remotePatterns: remotePatternHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
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
  async redirects() {
    return [
      {
        source: "/tests",
        destination: "/en/tests",
        permanent: true,
      },
      {
        source: "/tests/:path*",
        destination: "/en/tests/:path*",
        permanent: true,
      },
      {
        source: "/test",
        destination: "/en/tests",
        permanent: true,
      },
      {
        source: "/test/:path*",
        destination: "/en/tests/:path*",
        permanent: true,
      },
      {
        source: "/sitemap-en.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/sitemap-zh.xml",
        destination: "/sitemap.xml",
        permanent: true,
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
