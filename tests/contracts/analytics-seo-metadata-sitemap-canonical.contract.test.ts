import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPageMetadata, resolveCanonicalAuthority } from "@/lib/seo/metadata";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";
import { PRIVATE_FLOW_ROUTE_EXCLUDES, isSharedDiscoverabilityDeniedPath } from "@/lib/seo/discoverabilityExposurePolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("analytics SEO metadata sitemap canonical governance", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
  });

  it("rejects query, hash, cross-host, and private-flow canonical candidates for dynamic routes", () => {
    const expectedPathname = "/en/tests/mbti-personality-test-16-personality-types";

    for (const candidate of [
      "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types?utm_source=zhihu",
      "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types#faq",
      "https://staging.fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
      "https://fermatmind.com/en/result/private-result",
      "https://fermatmind.com/en/orders/ORD-RAW-123",
      "https://fermatmind.com/en/share/share-raw-123",
    ]) {
      const decision = resolveCanonicalAuthority({
        candidate,
        expectedPathname,
        currentLocale: "en",
        routeFamily: "test_detail",
      });
      expect(decision.status, candidate).toBe("rejected");
      expect(decision.canonicalPathname, candidate).toBe(expectedPathname);
      expect(decision.canonicalUrl, candidate).toBe(`https://fermatmind.com${expectedPathname}`);
    }
  });

  it("keeps metadata canonical and hreflang on safe localized public pages", () => {
    const metadata = buildPageMetadata({
      locale: "zh",
      pathname: "/zh/tests/mbti-personality-test-16-personality-types",
      canonicalPathname: "/zh/tests/mbti-personality-test-16-personality-types",
      canonicalRouteFamily: "test_detail",
      title: "MBTI 测试",
      description: "16 型人格测试",
      alternatesByLocale: {
        en: "/en/tests/mbti-personality-test-16-personality-types",
        zh: "/zh/tests/mbti-personality-test-16-personality-types",
        xDefault: "/en/tests/mbti-personality-test-16-personality-types",
      },
    });

    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
      "zh-CN": "https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types",
      "x-default": "https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types",
    });
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it("keeps result, order, share, payment, and take routes noindex and out of sitemap", () => {
    expect(PRIVATE_FLOW_ROUTE_EXCLUDES).toEqual([
      "/result/*",
      "/orders/*",
      "/share/*",
      "/pay/*",
      "/payment/*",
      "/history/*",
      "/tests/*/take",
    ]);

    for (const sample of [
      "/zh/result/private-result",
      "/zh/results/lookup",
      "/zh/orders/ORD-RAW-123",
      "/zh/orders/lookup?orderNo=ORD-RAW-123",
      "/zh/share/share-raw-123",
      "/zh/payment/stripe/success",
      "/zh/tests/mbti-personality-test-16-personality-types/take",
    ]) {
      expect(isSharedDiscoverabilityDeniedPath(sample), sample).toBe(true);
      expect(shouldNoindex(sample, "zh"), sample).toBe(true);
      expect(shouldIncludeInSitemap(sample), sample).toBe(false);
    }
  });

  it("keeps private route page metadata noindex and order canonical redacted", () => {
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const sharePage = read("app/(localized)/[locale]/share/[id]/page.tsx");
    const orderPage = read("app/(localized)/[locale]/orders/[orderNo]/page.tsx");
    const orderLookupPage = read("app/(localized)/[locale]/orders/lookup/page.tsx");

    expect(resultPage).toContain("NOINDEX_ROBOTS");
    expect(sharePage).toContain("noindex: true");
    expect(orderPage).toContain("NOINDEX_ROBOTS");
    expect(orderLookupPage).toContain("NOINDEX_ROBOTS");
    expect(orderPage).toContain('localizedPath("/orders/lookup", locale)');
    expect(orderLookupPage).toContain('localizedPath("/orders/lookup", locale)');
    expect(orderPage).not.toContain("canonical: localizedPath(`/orders/${orderNo}`");
    expect(orderLookupPage).not.toContain("orderNo=");
  });

  it("keeps robots, sitemap, dynamic route metadata, and breadcrumb schema wired to shared SEO helpers", () => {
    const robots = read("app/robots.ts");
    const sitemap = read("next-sitemap.config.js");
    const testDetail = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(robots).toContain("isConfiguredStagingSiteUrl");
    expect(robots).toContain('disallow: "/"');
    expect(robots).toContain("sitemap:");
    expect(sitemap).toContain("isSharedDiscoverabilityDeniedPath");
    expect(sitemap).toContain("SITEMAP_FINAL_PATH_DENY_PATTERNS");
    expect(testDetail).toContain("buildPageMetadata");
    expect(testDetail).toContain('canonicalRouteFamily: "test_detail"');
    expect(testDetail).toContain("buildBreadcrumbJsonLd");
    expect(testDetail).toContain("buildFAQPageJsonLd");
  });
});
