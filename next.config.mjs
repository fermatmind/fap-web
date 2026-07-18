/** @type {import('next').NextConfig} */
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://api.fermatmind.com").replace(/\/$/, "");
const enableSameOriginV03ApiProxy = process.env.NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY === "true";
const legacyPathMode = String(process.env.FAP_LEGACY_PATH_MODE || "redirect").trim().toLowerCase();
const enableRootQuizRedirects = legacyPathMode !== "gone";
const remotePatternHostnames = ["**.fermatmind.com"];
const publicV05ApiProxySources = [
  "/api/v0.5/articles",
  "/api/v0.5/articles/:slug",
  "/api/v0.5/articles/:slug/seo",
  "/api/v0.5/career-guides",
  "/api/v0.5/career-guides/:slug",
  "/api/v0.5/career-guides/:slug/seo",
  "/api/v0.5/career-jobs",
  "/api/v0.5/career-jobs/:slug",
  "/api/v0.5/career-jobs/:slug/seo",
  "/api/v0.5/career-recommendations/mbti",
  "/api/v0.5/career-recommendations/mbti/:type",
  "/api/v0.5/content-pages/:slug",
  "/api/v0.5/foundation/giving-records",
  "/api/v0.5/foundation/giving-records/:recordCode",
  "/api/v0.5/foundation/giving-records/months",
  "/api/v0.5/foundation/giving-records/months/:yearMonth",
  "/api/v0.5/landing-surfaces/:surfaceKey",
  "/api/v0.5/personality",
  "/api/v0.5/personality/comparisons/:slug",
  "/api/v0.5/personality/:slug",
  "/api/v0.5/personality/:slug/desktop-clone",
  "/api/v0.5/personality/:slug/seo",
  "/api/v0.5/support/articles",
  "/api/v0.5/support/articles/:slug",
  "/api/v0.5/support/guides",
  "/api/v0.5/support/guides/:slug",
  "/api/v0.5/topics",
  "/api/v0.5/topics/:slug",
  "/api/v0.5/topics/:slug/seo",
  "/api/v0.5/career/datasets/occupations",
  "/api/v0.5/career/datasets/occupations/method",
  "/api/v0.5/career/directory",
  "/api/v0.5/career/family/:slug",
  "/api/v0.5/career/first-wave/discoverability-manifest",
  "/api/v0.5/career/first-wave/jobs/:slug/next-step-links",
  "/api/v0.5/career/first-wave/launch-tier",
  "/api/v0.5/career/first-wave/readiness",
  "/api/v0.5/career/first-wave/recommendations/mbti/:type/companion-links",
  "/api/v0.5/career/jobs",
  "/api/v0.5/career/jobs/:slug",
  "/api/v0.5/career/jobs/:slug/explainability",
  "/api/v0.5/career/launch-governance-closure",
  "/api/v0.5/career/recommendations/mbti",
  "/api/v0.5/career/recommendations/mbti/:type",
  "/api/v0.5/career/recommendations/mbti/:type/explainability",
  "/api/v0.5/career/resolve",
  "/api/v0.5/career/runtime-config",
  "/api/v0.5/career/search",
  "/api/v0.5/career/shortlist",
  "/api/v0.5/career/shortlist/state",
  "/api/v0.5/career/transition-preview",
];
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];
const privateNoindexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nocache" },
  { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
  { key: "Referrer-Policy", value: "no-referrer" },
];
// Exact legacy URLs observed in GSC 404 samples. Keep this list narrow; remove
// entries in the same PR that introduces a real same-locale replacement page.
const gscLegacyRedirects = [
  {
    source: "/support",
    destination: "/zh/support",
    permanent: true,
  },
  {
    source: "/en/articles/big-five-growth-guide",
    destination: "/zh/articles/big-five-growth-guide",
    permanent: true,
  },
  {
    source: "/en/articles/mbti-basics",
    destination: "/zh/articles/mbti-basics",
    permanent: true,
  },
  {
    source: "/en/articles/iq-test-growth-guide",
    destination: "/zh/articles/iq-test-growth-guide",
    permanent: true,
  },
  {
    source: "/en/career/guides/from-mbti-to-job-fit",
    destination: "/zh/career/guides/from-mbti-to-job-fit",
    permanent: true,
  },
  {
    source: "/en/career/guides/cross-industry-move-strategy",
    destination: "/zh/career/guides/cross-industry-move-strategy",
    permanent: true,
  },
  {
    source: "/en/career/guides/networking-that-actually-works",
    destination: "/zh/career/guides/networking-that-actually-works",
    permanent: true,
  },
  {
    source: "/en/career/tests/riasec",
    destination: "/en/tests/holland-career-interest-test-riasec",
    permanent: true,
  },
  {
    source: "/zh/career/tests/riasec",
    destination: "/zh/tests/holland-career-interest-test-riasec",
    permanent: true,
  },
  {
    source: "/zh/career/jobs/lawyer",
    destination: "/zh/career/jobs/lawyers",
    permanent: true,
  },
];

// These ten routes are redirect-only aliases in both locale authorities. Use an
// explicit 301 (not Next's `permanent: true` 308) so their historical SEO
// signal converges on the backend-locked canonical target in one hop.
const bigFiveLegacyExact301Redirects = [
  ["high-openness", "openness-high"],
  ["low-openness", "openness-low"],
  ["high-conscientiousness", "conscientiousness-high"],
  ["low-conscientiousness", "conscientiousness-low"],
  ["high-extraversion", "extraversion-high"],
  ["low-extraversion", "extraversion-low"],
  ["high-agreeableness", "agreeableness-high"],
  ["low-agreeableness", "agreeableness-low"],
  ["high-neuroticism", "neuroticism-high"],
  ["emotional-stability", "neuroticism-low"],
].flatMap(([legacySlug, canonicalSlug]) =>
  ["zh", "en"].map((locale) => ({
    source: `/${locale}/personality/big-five/${legacySlug}`,
    destination: `/${locale}/personality/big-five/${canonicalSlug}`,
    statusCode: 301,
  }))
);

const nextConfig = {
  output: "standalone",
  staticPageGenerationTimeout: 240,
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
        has: [{ type: "host", value: "staging.fermatmind.com" }],
        headers: [{ key: "X-Robots-Tag", value }],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/result/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/result/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/result/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/orders/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/orders/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/orders/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/history/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/history/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/history/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/pay/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/pay/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/pay/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/payment/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/payment/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/payment/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/share/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/en/share/:path*",
        headers: privateNoindexHeaders,
      },
      {
        source: "/zh/share/:path*",
        headers: privateNoindexHeaders,
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
      ...bigFiveLegacyExact301Redirects,
      {
        source: "/privacy",
        destination: "/zh/privacy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/zh/terms",
        permanent: true,
      },
      {
        source: "/help",
        destination: "/zh/support",
        permanent: true,
      },
      {
        source: "/en/help",
        destination: "/en/support",
        permanent: true,
      },
      {
        source: "/zh/help",
        destination: "/zh/support",
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
        source: "/en/help/method-boundaries",
        destination: "/en/method-boundaries",
        permanent: true,
      },
      {
        source: "/zh/help/method-boundaries",
        destination: "/zh/method-boundaries",
        permanent: true,
      },
      {
        source: "/en/results",
        destination: "/en/results/lookup",
        permanent: true,
      },
      {
        source: "/zh/results",
        destination: "/zh/results/lookup",
        permanent: true,
      },
      {
        source: "/en/order/lookup",
        destination: "/en/orders/lookup",
        permanent: true,
      },
      {
        source: "/zh/order/lookup",
        destination: "/zh/orders/lookup",
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
      ...gscLegacyRedirects,
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
        ...(enableSameOriginV03ApiProxy
          ? [
              {
                source: "/api/v0.3/:path*",
                destination: `${apiOrigin}/api/v0.3/:path*`,
              },
            ]
          : []),
        ...publicV05ApiProxySources.map((source) => ({
          source,
          destination: `${apiOrigin}${source}`,
        })),
      ],
    };
  },
};

export default nextConfig;
