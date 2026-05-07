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
  it("points to the env-aware authoritative sitemap url", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://staging.fermatmind.com/sitemap.xml",
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
    expect(shouldIncludeInSitemap("/en/career/recommendations/mbti/INTJ")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/jobs")).toBe(false);
    expect(shouldIncludeInSitemap("/zh/career/jobs")).toBe(false);
    expect(shouldIncludeInSitemap("/en/career/jobs?q=backend")).toBe(false);

    expect(shouldIncludeInSitemap("/en/types/intj")).toBe(false);
    expect(shouldIncludeInSitemap("/en/share/share-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/result/attempt-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/results/lookup")).toBe(false);
    expect(shouldIncludeInSitemap("/en/history")).toBe(false);
  });

  it("continues to noindex private share and compare pages through page metadata", () => {
    const shareSource = read("app/(localized)/[locale]/share/[id]/page.tsx");
    const compareSource = read("app/(localized)/[locale]/compare/mbti/[inviteId]/page.tsx");
    const sbtiPageSource = read("app/(localized)/[locale]/fun/sbti/page.tsx");
    const sbtiResultSource = read("app/(localized)/[locale]/fun/sbti/result/page.tsx");

    expect(shareSource).toContain('viewModel.publicSurface?.robotsPolicy || ""');
    expect(shareSource).toContain("seoSurface: viewModel.seoSurface");
    expect(shareSource).toContain('? (fallbackRobotsPolicy ? fallbackRobotsPolicy.includes("noindex") : true)');
    expect(compareSource).toContain("noindex: true");
    expect(sbtiPageSource).toContain("noindex: true");
    expect(sbtiResultSource).toContain("noindex: true");
    expect(shouldNoindex("/en/share/share-123", "en")).toBe(true);
    expect(shouldNoindex("/en/result/attempt-123", "en")).toBe(true);
    expect(shouldNoindex("/en/results/lookup", "en")).toBe(true);
    expect(shouldNoindex("/en/career/jobs?q=backend", "en")).toBe(true);
    expect(shouldNoindex("/zh/fun/sbti", "zh", undefined, { indexEligible: false, indexState: "noindex" })).toBe(true);
  });

  it("keeps sbti fun routes outside sitemap generation", () => {
    const sitemapSource = read("lib/seo/sitemapAuthorityAdapters.cjs");

    expect(sitemapSource).toContain('"/en/fun/sbti"');
    expect(sitemapSource).toContain('"/zh/fun/sbti"');
    expect(sitemapSource).toContain('"/en/fun/sbti/*"');
    expect(sitemapSource).toContain('"/zh/fun/sbti/*"');
  });
});
