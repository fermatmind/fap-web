import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { situationalJudgementLandingSections, situationalJudgementLandingFaq } from "@/components/questionnaires/SituationalJudgementLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/situational-judgement.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual conditional situational practice editorial",()=>{
  it("uses dedicated condition cards and action-check artwork",()=>{
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<DiscoveryCardArt slug="situational-judgement" category="everyday"/>);
    expect(dom.querySelector('[data-composition="scenario-rule-cards:scenario-option-check:workspace"]')).not.toBeNull();
    expect(dom.querySelector('[data-scenario-rule-cards]')).not.toBeNull();expect(dom.querySelector('[data-scenario-option-check]')).not.toBeNull();
  });
  it("reproduces zero, partial and perfect examples with every worked answer and all four guides",()=>{
    for(const counts of [[0,0,0,0,0],[2,5,1,4,3],[5,5,5,5,5]]){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,(i-[0,5,10,15,20][quiz.directions.findIndex(d=>d.id===q.options[0].directionId)])<counts[quiz.directions.findIndex(d=>d.id===q.options[0].directionId)]?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id]));
      const result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete"||!("practice" in result))throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(counts.reduce((a,b)=>a+b,0));
      expect(quiz.directions.map(d=>result.practice.sections[d.id].correct)).toEqual(counts);
      expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("ability");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(25);expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(5);expect(dom.querySelectorAll("[data-practice-guide] h4")).toHaveLength(35);
        for(const q of quiz.questions)expect(dom.textContent).toContain(q.explanation![locale]);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs and resolving research citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"情境判断测试练什么？五类职场条件判断":"What does this Situational Judgement Test practise? Five workplace topics");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      expect(dom.querySelector('[aria-labelledby="questionnaire-method"]')?.textContent).toContain(quiz.guide.find(section=>section.id==="practice-score")!.paragraphs[0][locale]);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...situationalJudgementLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...situationalJudgementLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      expect(dom.querySelector('a[href="#situational-judgement-reference-0"]')).toBeNull();
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2,3])expect(dom.querySelector(`a[href="#situational-judgement-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
