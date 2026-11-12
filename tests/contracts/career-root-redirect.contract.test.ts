import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("career center route contract", () => {
  it("serves the full occupation directory at the locale career root", () => {
    const root = process.cwd();
    const pagePath = path.join(root, "app/(localized)/[locale]/career/page.tsx");
    const legacyPagePath = path.join(root, "app/(localized)/[locale]/career/jobs/page.tsx");
    const source = fs.readFileSync(pagePath, "utf8");

    expect(fs.existsSync(pagePath)).toBe(true);
    expect(fs.existsSync(legacyPagePath)).toBe(false);
    expect(source).toContain("fetchCareerDirectory");
    expect(source).toContain("adaptCareerDirectory");
    expect(source).toContain("搜索职业，查看工作职责与入行条件");
    expect(source).toContain('localizedPath("/career", locale)');
    expect(source).toContain('name="q"');
    expect(source).not.toContain("fetchCareerJobIndex");
    expect(source).not.toContain("找到适合你的职业方向");
  });

  it("permanently redirects the legacy jobs index to the career root", () => {
    const config = fs.readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");

    expect(config).toContain('source: "/:locale(en|zh)/career/jobs"');
    expect(config).toContain('destination: "/:locale/career"');
    expect(config).toContain("permanent: true");
  });
});
