import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { rizzLandingSections, rizzLandingFaq } from "@/components/questionnaires/RizzLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/rizz-test.json";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireRizzReport } from "@/components/questionnaires/QuestionnaireRizzReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual Rizz conversation editorial",()=>{
  it("renders the bespoke dialogue thread and invitation-choice scene",()=>{
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<DiscoveryCardArt slug="rizz-test" category="relationships"/>);
    expect(dom.querySelector('[data-composition="rizz-dialogue-thread:rizz-invitation-choice:workspace"]')).not.toBeNull();
    expect(dom.querySelector('[data-rizz-dialogue-thread]')).not.toBeNull();expect(dom.querySelector('[data-rizz-invitation-choice]')).not.toBeNull();
  });
  it("reproduces the nine-over-three example, insufficient and equal means with all full guides",()=>{
    const mixed=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));
    Object.assign(mixed,{RIZ_01:"1",RIZ_05:"3",RIZ_09:"5",RIZ_02:"2",RIZ_06:"4",RIZ_03:"2",RIZ_07:"4",RIZ_11:"5",RIZ_15:"4",RIZ_04:"1",RIZ_08:"2",RIZ_12:"3",RIZ_16:"4",RIZ_20:"5"});
    for(const answers of [mixed,Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])),Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]))]){
      const result=scoreLikertQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error("Complete expression attempt rejected");
      if(answers===mixed){expect(result.facets["showing-interest"]).toEqual({sum:9,rated:3,total:5,mean:3});expect(result.facets["threading-a-reply"]).toEqual({sum:6,rated:2,total:5,mean:null});expect(result.facets["offering-playfulness"]).toEqual({sum:15,rated:4,total:5,mean:3.8});expect(result.facets["checking-the-invitation"]).toEqual({sum:15,rated:5,total:5,mean:3});}
      expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("total");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireRizzReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-facet-score]")).toHaveLength(4);expect(dom.querySelectorAll("h4")).toHaveLength(36);
        for(const p of quiz.profiles)for(const s of p.sections)for(const paragraph of s.paragraphs)expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
  it("renders complete original and supplementary copy, fourteen FAQs and resolving conceptual citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    expect(rizzLandingSections).toHaveLength(9);expect(rizzLandingSections.flatMap(s=>s.paragraphs)).toHaveLength(18);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...rizzLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...rizzLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#rizz-test-reference-1"]')).not.toBeNull();
      for(const n of [1,2,3,4])expect(dom.querySelector(`a[href="#rizz-test-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
