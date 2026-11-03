import { egenTetoLandingSections, egenTetoLandingFaq } from "@/components/questionnaires/EgenTetoLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/egen-teto.json";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual Egen-Teto first-move editorial",()=>{
  it("reproduces every count pair and all nine-section outcomes without type percentages",()=>{
    for(let n=0;n<=18;n++){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options.find(o=>o.directionId===(i<n?"egen":"teto"))!.id]));
      const result=scoreDirectionalQuestionnaire(quiz,answers);
      if(result.status!=="complete")throw new Error("Complete witness rejected");
      expect(result.counts).toEqual({egen:n,teto:18-n});expect(result.profileId).toBe(n===9?"tie":n>9?"egen":"teto");
      expect(result).not.toHaveProperty("percentage");expect(result).not.toHaveProperty("hormones");
      const profile=quiz.profiles.find(p=>p.id===result.profileId)!;
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireReport profile={profile} locale={locale}/>);
        expect(dom.querySelectorAll("article>section")).toHaveLength(9);
        for(const section of profile.sections)for(const paragraph of section.paragraphs)expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs and resolving research citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(3);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...egenTetoLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...egenTetoLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [2])expect(dom.querySelector(`a[href="#egen-teto-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
