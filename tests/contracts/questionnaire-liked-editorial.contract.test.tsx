import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/likable-person-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { likableCurrentEntryCopy, likableLandingSummary } from "@/components/questionnaires/LikableLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual interaction-choice landing editorial", () => {
  it("renders worked means, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => likableLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(31);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(31);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "31种完整结果" : "Thirty-one full guides");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(likableCurrentEntryCopy(paragraph[locale], locale)));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|twenty-four hours|24 hours|24-hour|可选草稿|可选保存|optional drafts?|optional saving/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#likable-person-test-reference-5"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "4、4、4、4、4" : "4, 4, 4, 4 and 4");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
