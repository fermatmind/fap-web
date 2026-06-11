import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("locale purity contract", () => {
  it("keeps the MBTI local content pack off personality detail pages", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain("renderProjectionSections(detail.projection.sections, locale)");
    expect(source).toContain('data-testid="personality-detail-section-map"');
    expect(source).not.toContain("getMbtiPersonalityContent(detail.routeSlug, locale)");
    expect(source).not.toContain('data-testid="mbti-personality-content-pack"');
  });

  it("keeps topic operational labels localized for Chinese pages", () => {
    const indexSource = read("app/(localized)/[locale]/topics/page.tsx");
    const detailSource = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(indexSource).toContain('isZh ? "测试文章分类" : "Test article categories"');
    expect(indexSource).toContain('isZh ? "人格文章" : "Personality articles"');
    expect(indexSource).toContain('isZh ? "职业文章" : "Career articles"');
    expect(detailSource).toContain('locale === "zh" ? "主题摘要" : "Topic summary"');
    expect(detailSource).toContain('locale === "zh" ? "主题" : "Topic"');
    expect(detailSource).toContain("formatTopicDisplayCode(topic.topicCode || topic.slug)");
    expect(detailSource).toContain('locale === "zh" ? "索引状态" : "Indexing"');
  });
});
