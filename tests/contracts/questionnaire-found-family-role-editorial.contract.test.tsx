import { foundFamilyRoleLandingSections, foundFamilyRoleLandingFaq } from "@/components/questionnaires/FoundFamilyRoleLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/found-family-role-test.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"], "counts": [3, 3, 3, 3, 3, 3], "matched": 6}, {"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "B", "A", "A", "D", "D", "D", "C"], "counts": [5, 5, 2, 2, 2, 2], "matched": 2}, {"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "D", "C", "C"], "counts": [5, 4, 3, 2, 2, 2], "matched": 1}];
describe("individual voluntary friend-group contribution editorial",()=>{
  it("reproduces six-way, two-way and single examples without treating counts as predictions",()=>{
    for(const {answers,counts,matched} of witnesses){
      const result=scoreArchetypeQuestionnaire(quiz,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,answers[i]])));
      if(result.status!=="complete")throw new Error("Complete witness rejected");
      expect(Object.values(result.counts)).toEqual(counts);expect(result.profileIds).toHaveLength(matched);
      expect(result).not.toHaveProperty("percentile");expect(result).not.toHaveProperty("matchPercentage");
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale}/>);
        expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(matched);expect(dom.querySelectorAll("[data-archetype-match] h4")).toHaveLength(matched*9);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(6);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"找到家庭角色测试探索什么？六种自愿贡献":"What does this Found Family Role Test explore? Six voluntary contributions");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...foundFamilyRoleLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...foundFamilyRoleLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
