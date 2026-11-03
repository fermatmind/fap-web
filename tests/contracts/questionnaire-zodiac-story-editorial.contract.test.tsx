import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { zodiacStoryLandingSections, zodiacStoryLandingFaq } from "@/components/questionnaires/ZodiacStoryLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/zodiac-sign-quiz.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"], "counts": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], "matched": 12}, {"answers": ["A", "A", "A", "A", "A", "D", "A", "A", "A", "C", "A", "B"], "counts": [4, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0], "matched": 1}, {"answers": ["A", "A", "A", "A", "A", "D", "D", "A", "A", "C", "C", "A"], "counts": [3, 3, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1], "matched": 2}];
describe("individual zodiac sign story editorial",()=>{
  it("uses a storybook and alternative ending panels",()=>{ const html=renderToStaticMarkup(<DiscoveryCardArt slug="zodiac-sign-quiz" category="fantasy"/>); expect(html).toContain('data-composition="star-story-panels:star-open-ending:workspace"'); expect(html).toContain('data-star-story-panels="true"');expect(html).toContain('data-star-open-ending="true"'); });
  it("reproduces twelve-way, two-way and single examples without treating counts as predictions",()=>{
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
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(12);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"星座测试探索什么？十二种原创故事视角":"What does this Zodiac Sign Quiz explore? Twelve original story lenses");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...zodiacStoryLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...zodiacStoryLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2])expect(dom.querySelector(`a[href="#zodiac-sign-quiz-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
