import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { lovePersonalityLandingSections, lovePersonalityLandingFaq } from "@/components/questionnaires/LovePersonalityLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/love-personality.json";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["B", "A", "B", "A", "A", "B", "A", "B", "A", "B", "B", "A", "A", "B", "B", "A", "B", "A", "B", "A", "A", "B", "A", "B"], "counts": [6, 6, 6, 6], "profileId": "four-directions-tied", "sections": 10}, {"answers": ["B", "A", "B", "A", "A", "B", "A", "A", "A", "B", "B", "A", "A", "B", "A", "A", "B", "A", "B", "A", "A", "B", "A", "B"], "counts": [5, 7, 6, 6], "profileId": "attuned-response", "sections": 11}, {"answers": ["B", "A", "B", "A", "A", "B", "A", "B", "A", "B", "A", "B", "A", "B", "A", "B", "B", "A", "B", "A", "A", "B", "A", "B"], "counts": [8, 8, 4, 4], "profileId": "expression-response-tie", "sections": 10}, {"answers": ["B", "A", "B", "A", "A", "B", "A", "A", "A", "B", "A", "B", "A", "B", "B", "A", "A", "A", "B", "A", "A", "B", "A", "B"], "counts": [7, 7, 7, 3], "profileId": "expression-response-space-tie", "sections": 10}];
describe("individual love personality interaction editorial",()=>{
  it("uses four interaction entries and a dialogue check",()=>{ const html=renderToStaticMarkup(<DiscoveryCardArt slug="love-personality" category="relationships"/>); expect(html).toContain('data-composition="love-four-entries:love-dialogue-check:workspace"'); expect(html).toContain('data-love-four-entries="true"');expect(html).toContain('data-love-dialogue-check="true"'); });
  it("reproduces worked four-way, single, two-way and three-way counts with complete report bodies",()=>{
    for(const {answers,counts,profileId,sections} of witnesses){
      const result=scoreDirectionalQuestionnaire(quiz,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,answers[i]])));
      if(result.status!=="complete")throw new Error("Complete witness rejected");
      expect(Object.values(result.counts)).toEqual(counts);expect(result.profileId).toBe(profileId);
      const profile=quiz.profiles.find(p=>p.id===profileId)!;
      for(const locale of ["en","zh"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireReport profile={profile} locale={locale}/>);
        expect(dom.querySelectorAll("article > section")).toHaveLength(sections);
        for(const s of profile.sections)for(const paragraph of s.paragraphs)expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
  it("renders all original and supplementary bilingual paragraphs, fourteen FAQs and resolving research citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(15);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"恋爱人格测试探索什么？表达、回应、空间与修复":"What does the Love Personality Test explore? Expression, response, space and repair");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      expect(dom.querySelector(".questionnaire-method-part")?.textContent).toContain(quiz.guide.find(s=>s.id==="raw-count-method")!.paragraphs[0][locale]);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...lovePersonalityLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...lovePersonalityLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2])expect(dom.querySelector(`a[href="#love-personality-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
