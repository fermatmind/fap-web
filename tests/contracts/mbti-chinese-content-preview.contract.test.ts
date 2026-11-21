import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyChinesePreview, previewCodes, previewDimensions } from "@/app/(localized)/[locale]/(app)/dev/mbti-direct-result/content-preview";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";

function published(fullCode: string, locale = "zh-CN") {
  return {
    fullCode, baseCode: fullCode.slice(0, 4), locale,
    content: { hero: { summary: "CMS hero", profileIdentity: { code: fullCode, name: "CMS identity" } },
      chapters: { career: {}, growth: {}, relationships: {} } },
  } as PersonalityDesktopCloneContentPayload;
}

describe("Simplified Chinese MBTI editorial preview", () => {
  it("covers exactly 16 types and both suffixes without admitting other locales", () => {
    expect(new Set(previewCodes).size).toBe(32);
    expect(new Set(previewCodes.map((code) => code.slice(0, 4))).size).toBe(16);
    expect(() => applyChinesePreview(published("INFP-A", "en"))).toThrow(/zh-CN/);
    expect(() => applyChinesePreview(published("INFP-A", "zh-TW"))).toThrow(/zh-CN/);
    expect(() => applyChinesePreview(published("INVALID"))).toThrow();
    expect(() => previewDimensions("INVALID")).toThrow();
  });

  it.each(previewCodes)("keeps %s identity, chapter completeness, six-item groups and matching artwork", (code) => {
    const source = published(code);
    const result = applyChinesePreview(source);
    expect(result.data.fullCode).toBe(code);
    expect(result.data.content.hero).toEqual(source.content.hero);
    for (const chapter of Object.values(result.data.content.chapters)) {
      expect(chapter.intro).toHaveLength(2);
      expect(chapter.traitsUnlock?.items).toHaveLength(4);
      for (const block of [chapter.strengths, chapter.weaknesses]) {
        expect(block?.items).toHaveLength(6);
        expect(new Set(block?.items.map((item) => item.title)).size).toBe(6);
        for (const item of block?.items ?? []) expect(item.description).toMatch(/[。！？]$/);
      }
    }
    expect(Object.keys(result.applications)).toHaveLength(6);
    for (const block of Object.values(result.applications)) {
      expect(block.items).toHaveLength(6);
      expect(new Set(block.items.map((item) => item.title)).size).toBe(6);
    }
    expect(new Set(result.applications.careerIdeas?.items.map((item) => item.careerSlug)).size).toBe(6);
    expect(JSON.stringify(result)).not.toMatch(/把把|抽象倾向落到具体场景|成熟处理|它的价值不是显得能干/);
    const base = code.slice(0, 4).toLowerCase();
    for (const path of [`ai-conversation/${base}.webp`, `result-portraits/${base}.webp`, ...["career", "growth", "relationships"].map((chapter) => `result-chapters/${base}/${chapter}.webp`)]) {
      expect(existsSync(join(process.cwd(), "public/images/mbti", path)), path).toBe(true);
    }
    const dimensions = previewDimensions(code);
    expect(dimensions.map((axis) => axis.dominantPole).join("")).toBe(code.replace("-", ""));
  });

  it.each(previewCodes.filter((code) => code.endsWith("-A")))("does not turn the %s suffix into career or relationship competence", (code) => {
    const a = applyChinesePreview(published(code));
    const t = applyChinesePreview(published(code.replace("-A", "-T")));
    expect(t.data.content.chapters).toEqual(a.data.content.chapters);
    expect(t.applications).toEqual(a.applications);
    expect(previewDimensions(code.replace("-A", "-T"))[4].dominantPole).toBe("T");
  });

  it("provides different practical content for types with similar letters", () => {
    const infp = applyChinesePreview(published("INFP-T"));
    const intp = applyChinesePreview(published("INTP-T"));
    expect(infp.data.content.chapters.career.strengths).not.toEqual(intp.data.content.chapters.career.strengths);
    expect(infp.applications.careerIdeas).not.toEqual(intp.applications.careerIdeas);
    expect(infp.data.content.chapters.career.strengths?.items.some((item) => /价值/.test(item.title))).toBe(true);
    expect(intp.data.content.chapters.career.strengths?.items.some((item) => /模型/.test(item.title))).toBe(true);
  });
});
