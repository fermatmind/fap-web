import { maturityLandingSections, maturityLandingFaq } from "@/components/questionnaires/MaturityLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/maturity-test.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual four-practice maturity editorial", () => {
  it("reproduces rated-count, insufficient and equal-mean examples without a total or stage", () => {
    const rows = [["4","3","na","5","4","na"],["2","3","na","na","4","na"],["3","3","3","3","3","3"],["5","4","3","2","1","na"]];
    const answers = Object.fromEntries(quiz.questions.map(q => {
      const index = quiz.directions.findIndex(d => d.id===q.options[0].directionId);
      const siblings = quiz.questions.filter(item => item.options[0].directionId===q.options[0].directionId);
      return [q.id,rows[index][siblings.indexOf(q)]];
    }));
    const result=scoreQuestionnaire(quiz,answers);
    if(result.status!=="complete"||!("facets"in result))throw new Error("Complete examples rejected");
    expect(Object.values(result.facets)).toEqual([
      {sum:16,rated:4,total:6,mean:4},
      {sum:9,rated:3,total:6,mean:null},
      {sum:18,rated:6,total:6,mean:3},
      {sum:15,rated:5,total:6,mean:3},
    ]);
    expect(result).not.toHaveProperty("total");
    expect(result).not.toHaveProperty("leaders");
  });
  it("renders separate-mean examples, context distinctions, research scope and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(4);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "四部分完整" : "four complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of maturityLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...maturityLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24 hours|twenty-four hours|opt-in tab progress/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#maturity-test-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "4、3、不适用、5、4、不适用" : "4, 3, NA, 5, 4, NA");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
