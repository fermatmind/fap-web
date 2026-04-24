import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("locale purity contract", () => {
  it("keeps the zh-only MBTI local content pack off English personality detail pages", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('const personalityTypeContent = locale === "zh" ? getMbtiPersonalityContent(detail.routeSlug, locale) : null;');
  });

  it("keeps topic operational labels localized for Chinese pages", () => {
    const indexSource = read("app/(localized)/[locale]/topics/page.tsx");
    const detailSource = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(indexSource).toContain('locale === "zh" ? "主题中心" : "Topics CMS"');
    expect(detailSource).toContain('locale === "zh" ? "主题摘要" : "Topic summary"');
    expect(detailSource).toContain('locale === "zh" ? "主题代码" : "Topic code"');
    expect(detailSource).toContain('locale === "zh" ? "索引状态" : "Indexing"');
  });
});
