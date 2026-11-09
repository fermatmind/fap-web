import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/music-taste-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { musicCurrentEntryCopy, musicLandingSummary } from "@/components/questionnaires/MusicLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual music liking preference landing editorial", () => {
  it("renders worked means, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => musicLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(8);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(8);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "八类音乐偏好" : "Eight music preferences");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(musicCurrentEntryCopy(paragraph[locale], locale)));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24 hours|24-hour|可选草稿|草稿保存|同意保存草稿|optional drafts?|draft saving|agreement to save a draft/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#music-taste-test-reference-2"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "S=8、n=2" : "S=8 and n=2");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
