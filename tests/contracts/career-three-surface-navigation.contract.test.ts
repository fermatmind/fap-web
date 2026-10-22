import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career three-surface navigation contract", () => {
  it("keeps the career dropdown focused on test selection, fit, library, and guides in both locales", () => {
    const expected = {
      en: [
        { href: "/career/tests", label: "Choose career tests" },
        { href: "/career/recommendations", label: "Career fit" },
        { href: "/career", label: "Occupation library" },
        { href: "/career/guides", label: "Career Guides" },
      ],
      zh: [
        { href: "/career/tests", label: "职业测试选型" },
        { href: "/career/recommendations", label: "职业匹配" },
        { href: "/career", label: "职业库" },
        { href: "/career/guides", label: "职业指南" },
      ],
    } as const;

    for (const locale of ["en", "zh"] as const) {
      const careerMenu = getHeaderDropdownMenus(locale).find((menu) => menu.key === "career");
      expect(careerMenu?.items).toEqual(expected[locale]);
      expect(careerMenu?.items).toHaveLength(4);
      expect(careerMenu?.items.some((item) => item.href === "/career/industries")).toBe(false);
      expect(careerMenu?.items.some((item) => item.href === "/career/tests")).toBe(true);
    }
  });

  it("keeps career fit backed by the public recommendation index and exposes visible answer boundaries", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("fetchCareerRecommendationIndex");
    expect(source).toContain("adaptCareerRecommendationIndex");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain('id="faq"');
    expect(source).toContain("职业匹配：适合我的职业方向");
    expect(source).not.toContain("92% 匹配");
  });

  it("keeps career paths backed by published CMS guides and separate from occupation facts", () => {
    const source = read("app/(localized)/[locale]/career/guides/page.tsx");

    expect(source).toContain("listCareerGuidesFromCms");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain('id="faq"');
    expect(source).toContain("职业规划：找方向、比较职业与行动复盘");
    expect(source).not.toContain("listCareerJobs");
    expect(source).not.toContain("92% 匹配");
  });
});
