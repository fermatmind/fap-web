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

  it("keeps public pages indexable and blocks legacy/private paths from sitemap eligibility", () => {
    expect(shouldIncludeInSitemap("/en/personality/intj")).toBe(true);
    expect(shouldIncludeInSitemap("/zh/topics/mbti")).toBe(true);
    expect(shouldIncludeInSitemap("/en/help/faq")).toBe(true);
    expect(shouldIncludeInSitemap("/en/career/recommendations/mbti/INTJ")).toBe(true);

    expect(shouldIncludeInSitemap("/en/types/intj")).toBe(false);
    expect(shouldIncludeInSitemap("/en/share/share-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/result/attempt-123")).toBe(false);
    expect(shouldIncludeInSitemap("/en/history")).toBe(false);
  });

  it("continues to noindex private share and compare pages through page metadata", () => {
    const shareSource = read("app/(localized)/[locale]/share/[id]/page.tsx");
    const compareSource = read("app/(localized)/[locale]/compare/mbti/[inviteId]/page.tsx");

    expect(shareSource).toContain("noindex: true");
    expect(compareSource).toContain("noindex: true");
    expect(shouldNoindex("/en/share/share-123", "en")).toBe(true);
    expect(shouldNoindex("/en/result/attempt-123", "en")).toBe(true);
  });
});
