import { workplaceTechnologyLandingSections, workplaceTechnologyLandingFaq } from "@/components/questionnaires/WorkplaceTechnologyLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/workplace-technology.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual workplace-technology practice editorial",()=>{
  it("reproduces zero, nine and perfect examples with every worked answer and all four guides",()=>{
    for(const counts of [[0,0,0,0],[2,4,0,3],[4,4,4,4]]){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i%4<counts[Math.floor(i/4)]?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id]));
      const result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete"||!("practice" in result))throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(counts.reduce((a,b)=>a+b,0));
      expect(quiz.directions.map(d=>result.practice.sections[d.id].correct)).toEqual(counts);
      expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("ability");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(16);expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);expect(dom.querySelectorAll("[data-practice-guide] h4")).toHaveLength(20);
        for(const q of quiz.questions)expect(dom.textContent).toContain(q.explanation![locale]);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs and resolving research citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"职场技术与协作测试练什么？四类任务条件推理":"What does this Workplace Technology Test practise? Four groups of task-based reasoning");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...workplaceTechnologyLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...workplaceTechnologyLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1])expect(dom.querySelector(`a[href="#workplace-technology-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
