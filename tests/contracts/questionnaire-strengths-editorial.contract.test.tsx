import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/character-strengths.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { strengthsCurrentEntryCopy, strengthsLandingSummary } from "@/components/questionnaires/StrengthsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual public-domain character-strength landing editorial", () => {
  it("renders worked means, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => strengthsLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(24);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(24);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "24项性格优势" : "24 character strengths");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) {
        expect(body).toContain(normalize(strengthsCurrentEntryCopy(paragraph[locale], locale)));
      }
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24-hour|24 hours/);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#character-strengths-reference-4"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "16÷4=4.0" : "16/4=4.0");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
