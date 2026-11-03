import { QuestionnaireHabitsReport } from "@/components/questionnaires/QuestionnaireHabitsReport";
import { habitsLandingSections, habitsLandingFaq } from "@/components/questionnaires/HabitsLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/toxic-trait.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual five-practice habits editorial", () => {
  it("reproduces independent completeness and exact raw-sum report means", () => {
    const rows = [["1","2","3","3"],["4","4","4","na"],["3","3","3","3"],["5","4","3","2"],["1","1","1","1"]];
    const answers = Object.fromEntries(quiz.questions.map(q => {
      const index = quiz.directions.findIndex(d => d.id===q.options[0].directionId);
      const siblings = quiz.questions.filter(item => item.options[0].directionId===q.options[0].directionId);
      return [q.id,rows[index][siblings.indexOf(q)]];
    }));
    const result=scoreQuestionnaire(quiz,answers);
    if(result.status!=="complete"||!("facets"in result))throw new Error("Complete examples rejected");
    expect(Object.values(result.facets)).toEqual([
      {sum:9,rated:4,total:4,mean:2.3},
      {sum:12,rated:3,total:4,mean:null},
      {sum:12,rated:4,total:4,mean:3},
      {sum:14,rated:4,total:4,mean:3.5},
      {sum:4,rated:4,total:4,mean:1},
    ]);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");
      dom.innerHTML=renderToStaticMarkup(<QuestionnaireHabitsReport quiz={quiz} result={result} locale={locale}/>);
      expect(Array.from(dom.querySelectorAll("[data-habits-mean]"),e=>e.textContent)).toEqual(["2.25 / 5",locale==="zh"?"资料不足":"Insufficient information","3.00 / 5","3.50 / 5","1.00 / 5"]);
      expect(dom.querySelectorAll("[data-habits-profile] h4")).toHaveLength(45);
    }
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
      expect(new Set(summaries).size).toBe(5);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "五部分完整" : "five complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of habitsLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...habitsLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#toxic-trait-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "2.25/5" : "2.25/5");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
