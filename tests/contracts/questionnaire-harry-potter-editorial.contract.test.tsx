import { harryPotterLandingSections, harryPotterLandingFaq } from "@/components/questionnaires/HarryPotterLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/harry-potter-character.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"], "counts": [3, 3, 3, 3, 3, 3, 3], "matched": 7}, {"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "D", "C", "B", "B", "A", "C", "C", "D", "D", "C"], "counts": [6, 6, 2, 2, 2, 2, 1], "matched": 2}, {"answers": ["A", "A", "A", "A", "D", "C", "B", "A", "A", "A", "A", "D", "C", "B", "A", "A", "C", "C", "D", "C", "B"], "counts": [12, 3, 2, 2, 1, 1, 0], "matched": 1}];
describe("individual Harry Potter shared-activity editorial",()=>{
  it("reproduces seven-way, two-way and single examples without treating counts as predictions",()=>{
    for(const {answers,counts,matched} of witnesses){
      const result=scoreArchetypeQuestionnaire(quiz,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,answers[i]])));
      if(result.status!=="complete")throw new Error("Complete witness rejected");
      expect(Object.values(result.counts)).toEqual(counts);expect(result.profileIds).toHaveLength(matched);
      expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("matchPercentage");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(matched);expect(dom.querySelectorAll("[data-archetype-match] h4")).toHaveLength(matched*7);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs and resolving research citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(7);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...harryPotterLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...harryPotterLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2,3,4,5])expect(dom.querySelector(`a[href="#harry-potter-character-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
