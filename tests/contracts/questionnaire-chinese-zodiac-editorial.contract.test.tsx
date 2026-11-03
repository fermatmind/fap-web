import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { chineseZodiacLandingSections, chineseZodiacLandingFaq } from "@/components/questionnaires/ChineseZodiacLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/chinese-zodiac.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"], "counts": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], "matched": 12}, {"answers": ["A", "A", "A", "A", "A", "A", "D", "A", "C", "A", "A", "B"], "counts": [4, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0], "matched": 1}, {"answers": ["A", "A", "A", "A", "A", "A", "D", "D", "C", "C", "A", "A"], "counts": [3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1], "matched": 2}];
describe("individual Chinese zodiac story editorial",()=>{
  it("uses twelve cultural seals and an open storybook",()=>{ const html=renderToStaticMarkup(<DiscoveryCardArt slug="chinese-zodiac" category="fantasy"/>); expect(html).toContain('data-composition="zodiac-twelve-seals:zodiac-story-pages:workspace"'); expect(html).toContain('data-zodiac-twelve-seals="true"');expect(html).toContain('data-zodiac-story-pages="true"'); });
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
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"中国十二生肖测试探索什么？文化意象与原创故事角色":"What does this Chinese Zodiac Quiz explore? Culture and original story roles");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...chineseZodiacLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...chineseZodiacLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2])expect(dom.querySelector(`a[href="#chinese-zodiac-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
