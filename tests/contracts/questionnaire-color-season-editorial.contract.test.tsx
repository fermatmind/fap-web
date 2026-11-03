import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/color-season.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { colorSeasonLandingSections, colorSeasonLandingFaq } from "@/components/questionnaires/ColorSeasonLandingEditorial";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
describe("individual visible palette editorial",()=>{
  it("uses dedicated swatches and area-comparison art",()=>{
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="framework"/>);
    expect(dom.querySelector('[data-composition="season-swatches:palette-layout:workspace"]')).not.toBeNull();
    expect(dom.querySelector('[data-season-swatches]')).not.toBeNull();expect(dom.querySelector('[data-palette-layout]')).not.toBeNull();
  });
  it("retains the exact highest sets and nine full sections per selected guide",()=>{
    for(const counts of [[16,0,0,0],[6,6,3,1],[7,5,3,1],[4,4,4,4]]){
      const targets=quiz.directions.flatMap((d,i)=>Array(counts[i]).fill(d.id));
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options.find(o=>o.directionId===targets[i])!.id]));
      const result=scoreArchetypeQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error("Witness rejected");
      expect(quiz.directions.map(d=>result.counts[d.id])).toEqual(counts);
      const highest=quiz.directions.filter((_,i)=>counts[i]===Math.max(...counts)).map(d=>d.id);
      expect(result.profileIds).toEqual(highest);
      for(const locale of ["zh","en"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(highest.length);
        expect(dom.querySelectorAll("h4")).toHaveLength(9*highest.length);
        expect(dom.querySelectorAll("[data-palette-colour]")).toHaveLength(6*highest.length);
        for(const p of quiz.profiles.filter(p=>highest.includes(p.id)))for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);
      }
    }
  });
  it("renders the original and supplementary bilingual text, fourteen FAQ and every primary reference",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(v=>v.slug===quiz.slug)?.description).toEqual(quiz.description);
    expect(quiz.references).toBeUndefined();
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"色彩季节测试探索什么？可见配色与偏好范围":"What does this Color Analysis Quiz explore? Visible palettes and preference scope");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const section of [...quiz.guide,...colorSeasonLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      for(const faq of [...quiz.faq,...colorSeasonLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const c of citations)expect(dom.querySelector(c.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2,3])expect(dom.querySelector(`a[href="#color-season-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
