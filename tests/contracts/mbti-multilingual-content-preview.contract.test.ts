import { describe, expect, it } from "vitest";
import { applyLocalizedPreview, localizedDimensions } from "@/app/(localized)/[locale]/(app)/dev/mbti-direct-result/localized-preview";
import { previewCodes, previewDimensions } from "@/app/(localized)/[locale]/(app)/dev/mbti-direct-result/content-preview";
import source from "@/lib/mbti/result-content/content.zh-CN.json";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
const published = (code: string) => ({ fullCode: code, baseCode: code.slice(0, 4), locale: "zh-CN", content: {
  hero: { summary: "源内容", profileIdentity: { code, name: "源类型" } }, overview: { title: "旧正文", paragraphs: ["旧正文"] },
  chapters: { career: {}, growth: {}, relationships: {} }, finalOffer: { price: 1299, currency: "CNY" },
} }) as unknown as PersonalityDesktopCloneContentPayload;

describe.each(["en", "zh-TW"] as const)("%s result editorial candidates", (language) => {
  it.each(previewCodes)("preserves %s identity, chapter structure and career targets", (code) => {
    const input = published(code);
    const before = JSON.stringify(input);
    const result = applyLocalizedPreview(input, language);
    expect(JSON.stringify(input)).toBe(before);
    expect(result.data.fullCode).toBe(code);
    const baseline = source.types[code.slice(0, 4) as keyof typeof source.types];
    for (const chapter of Object.values(result.data.content.chapters)) {
      expect(chapter.intro).toHaveLength(2);
      expect(chapter.traitsUnlock?.items).toHaveLength(4);
      expect(chapter.strengths?.items).toHaveLength(6);
      expect(chapter.weaknesses?.items).toHaveLength(6);
    }
    for (const block of Object.values(result.applications)) {
      expect(block.items).toHaveLength(6);
      expect(new Set(block.items.map((x) => x.title)).size).toBe(6);
    }
    expect(result.applications.careerIdeas?.items.map((x) => x.careerSlug)).toEqual(baseline.applications.careerIdeas.items.map((x) => x.careerSlug));
    expect(localizedDimensions(code, language).map((x) => [x.axisCode, x.dominantPole, x.dominantPct])).toEqual(previewDimensions(code).map((x) => [x.axisCode, x.dominantPole, x.dominantPct]));
    if (language === "en") {
      expect(JSON.stringify(result.data.content.chapters) + JSON.stringify(result.applications)).not.toMatch(/[\u3400-\u9fff]/);
      expect(JSON.stringify(result.data.content.overview)).not.toMatch(/[\u3400-\u9fff]/);
    }
  });
  it("does not turn A/T into career or relationship competence", () => {
    for (const code of previewCodes.filter((x) => x.endsWith("-A"))) {
      const a = applyLocalizedPreview(published(code), language);
      const t = applyLocalizedPreview(published(code.replace("-A", "-T")), language);
      expect(a.data.content.chapters).toEqual(t.data.content.chapters);
      expect(a.applications).toEqual(t.applications);
    }
  });
  it("fails closed on the wrong source locale", () => {
    expect(() => applyLocalizedPreview({ ...published("INFP-T"), locale: "en" }, language)).toThrow();
  });
});
