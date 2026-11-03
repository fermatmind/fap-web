import { feminineEnergyLandingSections, feminineEnergyLandingFaq } from "@/components/questionnaires/FeminineEnergyLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/feminine-energy.json";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireExpressionReport } from "@/components/questionnaires/QuestionnaireExpressionReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual feminine expression editorial",()=>{
  it("reproduces the eleven-over-three example, insufficient and equal means with all full guides",()=>{
    const mixed=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));
    Object.assign(mixed,{FEXP_01:"2",FEXP_05:"4",FEXP_09:"5",FEXP_02:"2",FEXP_06:"4"});
    for(const answers of [mixed,Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])),Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]))]){
      const result=scoreLikertQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error("Complete expression attempt rejected");
      if(answers===mixed){expect(result.facets["playful-warmth"]).toEqual({sum:11,rated:3,total:5,mean:3.7});expect(result.facets["expressive-flair"]).toEqual({sum:6,rated:2,total:5,mean:null});}
      expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("total");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireExpressionReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-facet-score]")).toHaveLength(4);expect(dom.querySelectorAll("h4")).toHaveLength(36);
        for(const p of quiz.profiles)for(const s of p.sections)for(const paragraph of s.paragraphs)expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
  it("renders complete original and supplementary copy, fourteen FAQs and resolving conceptual citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    expect(feminineEnergyLandingSections).toHaveLength(8);expect(feminineEnergyLandingSections.flatMap(s=>s.paragraphs)).toHaveLength(16);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...feminineEnergyLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...feminineEnergyLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#feminine-energy-reference-1"]')).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
