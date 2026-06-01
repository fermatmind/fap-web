import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots contract", () => {
  it("blocks staging robots without advertising a staging sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });

  it("converges FermatMind www to the apex sitemap url", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.fermatmind.com");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://fermatmind.com/sitemap.xml",
    });
  });

  it("keeps public pages indexable and blocks legacy/private paths from sitemap eligibility", () => {
    expect(shouldIncludeInSitemap("/en/personality/intj")).toBe(true);
    expect(shouldIncludeInSitemap("/zh/topics/mbti")).toBe(true);
    expect(shouldIncludeInSitemap("/en/help/faq")).toBe(true);
    expect(shouldIncludeInSitemap("/en/method-boundaries")).toBe(true);
    expect(shouldIncludeInSitemap("/zh/method-boundaries")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/recommendations/mbti/INTJ")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/jobs")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/career/jobs")).toBe(false);
    expect(shouldIncludeInSitemap("/en/career/jobs?q=backend")).toBe(false);

    expect(shouldIncludeInSitemap("/en/types/intj")).toBe(false);
    expect(shouldIncludeInSitemap("/en/share/share-123")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/share/share-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/result/attempt-123")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/result/attempt-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/orders/order-123")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/orders/order-123")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/orders/lookup?orderNo=order-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/results/lookup")).toBe(false);
    expect(shouldIncludeInSitemap("/en/history")).toBe(false);
  });

  it("continues to noindex private result, order, share, and compare pages through metadata", () => {
    const shareSource = read("app/(localized)/[locale]/share/[id]/page.tsx");
    const resultSource = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const orderLookupSource = read("app/(localized)/[locale]/orders/lookup/page.tsx");
    const orderSource = read("app/(localized)/[locale]/orders/[orderNo]/page.tsx");
    const compareSource = read("app/(localized)/[locale]/compare/mbti/[inviteId]/page.tsx");

    expect(shareSource).toContain("seoSurface: viewModel.seoSurface");
    expect(shareSource).toContain("noindex: true");
    expect(resultSource).toContain("robots: NOINDEX_ROBOTS");
    expect(orderLookupSource).toContain("robots: NOINDEX_ROBOTS");
    expect(orderLookupSource).toContain('canonical: localizedPath("/orders/lookup", locale)');
    expect(orderSource).toContain("robots: NOINDEX_ROBOTS");
    expect(orderSource).toContain('canonical: localizedPath("/orders/lookup", locale)');
    expect(orderSource).not.toContain("localizedPath(`/orders/${orderNo}`, locale)");
    expect(compareSource).toContain("noindex: true");
    expect(shouldNoindex("/en/share/share-123", "en")).toBe(true);
    expect(shouldNoindex("/zh/share/share-123", "zh")).toBe(true);
    expect(shouldNoindex("/en/result/attempt-123", "en")).toBe(true);
    expect(shouldNoindex("/zh/result/attempt-123", "zh")).toBe(true);
    expect(shouldNoindex("/en/orders/order-123", "en")).toBe(true);
    expect(shouldNoindex("/zh/orders/order-123", "zh")).toBe(true);
    expect(shouldNoindex("/zh/orders/lookup?orderNo=order-123", "zh")).toBe(true);
    expect(shouldNoindex("/en/results/lookup", "en")).toBe(true);
    expect(shouldNoindex("/en/method-boundaries", "en")).toBe(false);
    expect(shouldNoindex("/zh/method-boundaries", "zh")).toBe(false);
    expect(shouldNoindex("/en/career/jobs?q=backend", "en")).toBe(true);
  });
});
