/** @type {import('next').NextConfig} */
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
const cspReportOnlyDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https:",
  "frame-src 'self'",
];
const cspReportOnlyValue = cspReportOnlyDirectives.join("; ");
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnlyValue },
];

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
        source: "/:path*",
        headers: securityHeaders,
      },
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
        source: "/api/:path*",
        destination: "https://api.fermatmind.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
