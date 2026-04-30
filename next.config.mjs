/** @type {import('next').NextConfig} */
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.fermatmind.com").replace(/\/$/, "");
const legacyPathMode = String(process.env.FAP_LEGACY_PATH_MODE || "redirect").trim().toLowerCase();
const enableRootQuizRedirects = legacyPathMode !== "gone";
const remotePatternHostnames = ["**.fermatmind.com"];
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
  assetPrefix: undefined,
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
        source: "/en/result/:path*",
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
        source: "/en/orders/:path*",
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
        source: "/en/share/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/zh/share/:path*",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/tests/:slug/take",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/en/tests/:slug/take",
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/zh/tests/:slug/take",
        headers: [{ key: "X-Robots-Tag", value }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.fermatmind.com" }],
        destination: "https://fermatmind.com/:path*",
        permanent: true,
      },
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
        source: "/help/about",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/zh/help/about",
        destination: "/zh/support",
        permanent: true,
      },
      {
        source: "/help/used-and-mentioned",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/zh/help/used-and-mentioned",
        destination: "/zh/support",
        permanent: true,
      },
      {
        source: "/help/team",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/zh/help/team",
        destination: "/zh/support",
        permanent: true,
      },
      {
        source: "/careers",
        destination: "/zh/careers",
        permanent: true,
      },
      {
        source: "/refund",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/en/refund",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/zh/refund",
        destination: "/zh/support",
        permanent: true,
      },
      ...(enableRootQuizRedirects
        ? [
            {
              source: "/quiz",
              destination: "/en/tests",
              permanent: true,
            },
            {
              source: "/quiz/:slug",
              destination: "/en/tests/:slug",
              permanent: true,
            },
          ]
        : []),
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
    return {
      beforeFiles: [
        {
          source: "/api/v0.3/:path*",
          destination: `${apiOrigin}/api/v0.3/:path*`,
        },
        {
          source: "/api/v0.5/:path*",
          destination: `${apiOrigin}/api/v0.5/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
