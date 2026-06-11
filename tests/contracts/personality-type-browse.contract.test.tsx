import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("personality type browse contract", () => {
  const pageSource = read("app/(localized)/[locale]/personality/page.tsx");
  const detailSource = read("app/(localized)/[locale]/personality/[type]/page.tsx");
  const resultSource = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");

  it("keeps NT, NF, SJ, and SP as the second layer of the personality index", () => {
    const payload = buildPersonalityHubPayload({
      locale: "zh",
      canonicalPath: "/zh/personality",
      landingSurface: null,
      personalities: [],
    });

    expect(payload.familyGroups.map((group) => group.groupKey)).toEqual(["NT", "NF", "SJ", "SP"]);
    expect(payload.familyGroups.flatMap((group) => group.cards)).toHaveLength(16);
    expect(pageSource).toContain('id="type-groups"');
    expect(pageSource).toContain('data-testid="personality-type-group-browse"');
    expect(pageSource).toContain('data-testid="personality-type-directory"');
    expect(pageSource).toContain("formatTypeLabel(type)");
    expect(pageSource).not.toContain("{type.typeCode} · {type.title}");
  });

  it("removes theme navigation from the personality index", () => {
    expect(pageSource).not.toContain('data-testid="personality-quiet-theme-library"');
    expect(pageSource).not.toContain("继续阅读");
    expect(pageSource).not.toContain("这些是人格内容的延伸方向");
    expect(pageSource).not.toContain("按决策场景选择入口");
  });

  it("keeps personality detail and MBTI result pages oriented to final content and next steps", () => {
    expect(detailSource).toContain('data-testid="personality-detail-next-steps"');
    expect(detailSource).toContain("看职业方向");
    expect(detailSource).toContain("返回 16 型浏览");
    expect(detailSource).toContain("MBTI免费测试");
    expect(detailSource).toContain("人格解读");
    expect(detailSource).toContain("核心画像");
    expect(detailSource).toContain("下一步阅读");
    expect(detailSource).not.toContain("内容包");
    expect(detailSource).not.toContain("通用页框架");
    expect(detailSource).not.toContain("继续入口");
    expect(detailSource).not.toContain("SEO snapshot");
    expect(detailSource).not.toContain("Profile summary");
    expect(resultSource).toContain('data-testid="mbti-result-personality-next-step"');
    expect(resultSource).toContain("查看人格类型内容");
  });
});
