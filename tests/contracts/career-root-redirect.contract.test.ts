import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("career center route contract", () => {
  it("serves a focused career center instead of redirecting the locale root", () => {
    const root = process.cwd();
    const pagePath = path.join(root, "app/(localized)/[locale]/career/page.tsx");
    const config = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");
    const source = fs.readFileSync(pagePath, "utf8");

    expect(fs.existsSync(pagePath)).toBe(true);
    expect(config).not.toContain('source: "/:locale(en|zh)/career"');
    expect(source).toContain("找到适合你的职业方向");
    expect(source).toContain('action={withLocale("/career/jobs")}');
    expect(source).toContain('name="q"');
    expect(source).toContain('href={withLocale("/career/jobs")}');
    expect(source).toContain('href={withLocale("/career/recommendations")}');
    expect(source).toContain('href={withLocale("/career/guides")}');
    expect(source).not.toContain("fetchCareerJobIndex");
    expect(source).not.toContain("fetchCareerLaunchGovernanceClosure");
  });
});
