import { QuestionnaireGritReport } from "@/components/questionnaires/QuestionnaireGritReport";
import { gritLandingSections, gritLandingFaq } from "@/components/questionnaires/GritLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/grit-test.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual long-term-goal editorial", () => {
  it("reproduces independent completeness and exact raw-sum report means", () => {
    const rows = [["1","1","2","2","2","2","na","na"],["4","4","4","4","4","na","na","na"]];
    const answers = Object.fromEntries(quiz.questions.map(q => {
      const index = quiz.directions.findIndex(d => d.id===q.options[0].directionId);
      const siblings = quiz.questions.filter(item => item.options[0].directionId===q.options[0].directionId);
      const value=rows[index][siblings.indexOf(q)];
      return [q.id,value==="na"?value:q.reverse?String(6-Number(value)):value];
    }));
    const result=scoreQuestionnaire(quiz,answers);
    if(result.status!=="complete"||!("facets"in result))throw new Error("Complete examples rejected");
    expect(Object.values(result.facets)).toEqual([
      {sum:10,rated:6,total:8,mean:1.7},
      {sum:20,rated:5,total:8,mean:null},
    ]);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");
      dom.innerHTML=renderToStaticMarkup(<QuestionnaireGritReport quiz={quiz} result={result} locale={locale}/>);
      expect(Array.from(dom.querySelectorAll("[data-grit-mean]"),e=>e.textContent)).toEqual(["1.67 / 5",locale==="zh"?"资料不足":"Insufficient information"]);
      expect(dom.querySelectorAll("[data-grit-profile] h4")).toHaveLength(18);
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
      expect(new Set(summaries).size).toBe(2);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(2);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "两部分完整" : "two complete");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const faq of gritLandingFaq) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...gritLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#grit-test-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "10÷6=1.67/5" : "10÷6=1.67/5");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
