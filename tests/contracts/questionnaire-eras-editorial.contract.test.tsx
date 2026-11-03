import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { erasOfYouLandingSections, erasOfYouLandingFaq, erasOfYouLandingReferences } from "@/components/questionnaires/ErasOfYouLandingEditorial";
import raw from "@/lib/questionnaires/data/eras-of-you-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireChapterReport } from "@/components/questionnaires/QuestionnaireChapterReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual current-chapter entry editorial",()=>{
  it("shows book chapters and parallel observations without an age ladder",()=>{
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="everyday"/>);
    expect(dom.querySelector('[data-composition="chapter-tabs:parallel-threads:workspace"]')).not.toBeNull();
    expect(dom.querySelector("[data-era-chapters]")).not.toBeNull();expect(dom.querySelector("[data-era-threads]")).not.toBeNull();
  });
  it("reproduces means and insufficient information without losing any of the 54 guide sections",()=>{
    for(const [pattern,sum,rated,mean] of [
      [["1","2","4","na"],7,3,2.3],[["4","4","4","5"],17,4,4.3],[["5","5","na","na"],10,2,null],[["5","5","5","na"],15,3,5],[["na","na","na","na"],0,0,null],[["1","1","1","1"],4,4,1],[["5","5","5","5"],20,4,5],
    ] as const){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,pattern[Math.floor(i/6)]]));
      const result=scoreLikertQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error("Witness rejected");
      for(const d of quiz.directions)expect(result.facets[d.id]).toEqual({sum,rated,total:4,mean});
      for(const k of ["profileId","total","percentile"])expect(result).not.toHaveProperty(k);
      for(const locale of ["zh","en"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireChapterReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-facet-score]")).toHaveLength(6);expect(dom.querySelectorAll("h4")).toHaveLength(54);
        for(const p of quiz.profiles)for(const section of p.sections)for(const para of section.paragraphs)expect(dom.textContent).toContain(para[locale]);
        if(mean===null)expect(dom.textContent).toContain(locale==="zh"?"资料不足":"Insufficient information");
      }
    }
  });
  it("renders bilingual complete entry content and separately scoped methodological references",async()=>{
    const {default:Page}=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
    expect(quiz.references).toBeUndefined();
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await Page({params:Promise.resolve({slug:quiz.slug,locale})}));
      const normal=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normal(dom.textContent??"");
      expect(dom.querySelectorAll("h1")).toHaveLength(1);expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(6);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      for(const section of [...quiz.guide,...erasOfYouLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normal(paragraph[locale]));
      for(const faq of [...quiz.faq,...erasOfYouLandingFaq])expect(body).toContain(normal(faq.answer[locale]));
      for(const [i,reference] of erasOfYouLandingReferences.entries()){
        expect(dom.querySelector(`a[href="#eras-of-you-test-reference-${i+1}"]`)).not.toBeNull();
        expect(dom.querySelector(`#eras-of-you-test-reference-${i+1} a`)?.getAttribute("href")).toBe(reference.url);
      }
      expect(dom.querySelectorAll(".disc-source-citation").length).toBeGreaterThan(0);
      expect(dom.querySelector("[data-facet-score]")).toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
