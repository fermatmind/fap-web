/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const tests = require("./.velite/tests.json");

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");

function normalizeSlug(value) {
  return String(value || "").trim();
}

function hasIndexableFlagFalse(item) {
  return item && item.is_indexable === false;
}

function buildTestPaths() {
  const uniqueSlugs = new Set();
  for (const item of tests) {
    const slug = normalizeSlug(item?.slug);
    if (!slug || hasIndexableFlagFalse(item)) continue;
    uniqueSlugs.add(slug);
  }

  const paths = [];
  for (const slug of uniqueSlugs) {
    paths.push(`/en/tests/${slug}`);
    paths.push(`/zh/tests/${slug}`);
  }
  return paths;
}

const generatedTestPaths = buildTestPaths();

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: [
    "/api/*",
    "/en/result/*",
    "/zh/result/*",
    "/en/share/*",
    "/zh/share/*",
    "/en/orders/*",
    "/zh/orders/*",
    "/og/*",
    "/en/tests/*/take",
    "/zh/tests/*/take",
    "/server-sitemap.xml",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/zh", "/en/tests", "/zh/tests", "/en/tests/*", "/zh/tests/*", "/en/blog/*", "/zh/blog/*"],
        disallow: [
          "/api/",
          "/en/tests/*/take",
          "/zh/tests/*/take",
          "/en/result/",
          "/zh/result/",
          "/en/share/",
          "/zh/share/",
          "/en/orders/",
          "/zh/orders/",
          "/og/",
        ],
      },
    ],
  },
  additionalPaths: async () =>
    generatedTestPaths.map((loc) => ({
      loc,
      changefreq: "weekly",
      priority: 0.7,
    })),
};
