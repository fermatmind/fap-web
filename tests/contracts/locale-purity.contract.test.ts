import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("locale purity contract", () => {
  it("keeps the MBTI local content pack off personality detail pages", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain("renderProjectionSections(");
    expect(source).toContain("detail.projection.sections");
    expect(source).toContain('data-testid="personality-detail-section-map"');
    expect(source).not.toContain("getMbtiPersonalityContent(detail.routeSlug, locale)");
    expect(source).not.toContain('data-testid="mbti-personality-content-pack"');
  });

  it("keeps topic journey labels localized for Chinese pages", () => {
    const indexSource = read("app/(localized)/[locale]/topics/page.tsx");
    const detailSource = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(indexSource).toContain('isZh ? "认识自己，从好问题开始。" : "Understand yourself. Start with a good question."');
    expect(indexSource).toContain('isZh ? "按问题找答案" : "Find an answer to your question"');
    expect(indexSource).toContain('isZh ? "精选阅读" : "Featured reading"');
    expect(indexSource).not.toContain('isZh ? "测评主题" : "Explore by model"');
    expect(indexSource).not.toContain('isZh ? "测评能回答什么，不能回答什么" : "What assessments can and cannot answer"');
    expect(indexSource.indexOf('aria-labelledby="method-links-title"')).toBeGreaterThan(
      indexSource.indexOf('aria-labelledby="topics-recommended-title"'),
    );
    expect(detailSource).toContain('locale === "zh" ? "主题摘要" : "Topic summary"');
    expect(detailSource).toContain('locale === "zh" ? "主题" : "Topic"');
    expect(detailSource).toContain("formatTopicDisplayCode(topic.topicCode || topic.slug)");
    expect(detailSource).not.toContain('locale === "zh" ? "索引状态" : "Indexing"');
    expect(detailSource).not.toContain("SEO snapshot");
    expect(detailSource).toContain("buildPageMetadata(");
  });
});
