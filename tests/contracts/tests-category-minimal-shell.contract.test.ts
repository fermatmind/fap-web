import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";
import { buildPublicSitemapEntries } from "@/lib/seo/publicSitemap";

describe("retired test categories", () => {
  it("removes the public page routes", () => {
    expect(existsSync("app/(localized)/[locale]/tests/category/[slug]/page.tsx")).toBe(false);
    expect(existsSync("app/(traditional)/zh-TW/tests/category/[slug]/page.tsx")).toBe(false);
  });

  it.each(["zh", "zh-TW", "en"] as const)("shows eleven test menu items and excludes retired URLs in %s", (locale) => {
    const tests = getHeaderDropdownMenus(locale).find((menu) => menu.key === "tests");
    expect(tests?.items.map((item) => item.href)).toEqual([
      "/tests",
      "/tests/mbti-personality-test-16-personality-types",
      "/tests/holland-career-interest-test-riasec",
      "/tests/career-planning-and-work-style-test",
      "/tests/iq-test-intelligence-quotient-assessment",
      "/tests/big-five-personality-test-ocean-model",
      "/tests/enneagram-personality-test-nine-types",
      "/tests/jung-test",
      "/tests/disc-behavioral-style-test",
      "/tests/eq-test-emotional-intelligence-assessment",
      "/tests/explore/mental-age",
    ]);
    expect(tests?.items[3].label).toBe({
      zh: "职业测试",
      "zh-TW": "職涯測驗",
      en: "Career Assessment",
    }[locale]);
    const hub = `https://fermatmind.com/${locale}/tests`;
    expect(buildPublicSitemapEntries({
      items: [
        { loc: hub },
        ...["personality", "personalit", "career"].map((slug) => ({ loc: `${hub}/category/${slug}` })),
      ],
    })).toEqual([{ loc: hub }]);
  });
});
