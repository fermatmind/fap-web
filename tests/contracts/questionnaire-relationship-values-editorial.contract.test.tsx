import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { relationshipValuesLandingSections, relationshipValuesLandingFaq } from "@/components/questionnaires/RelationshipValuesLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/relationship-values.json";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=raw as Questionnaire;
const witnesses=[{"answers": ["o1", "o2", "o1", "o2", "o2", "o1", "o2", "o1", "o2", "o1", "o1", "o2", "o2", "o1", "o1", "o2", "o1", "o2", "o1", "o2", "o2", "o1", "o2", "o1"], "counts": [6, 6, 6, 6], "profileId": "four-values-tied", "sections": 7, "title": {"en": "All Four Relationship Values Tied", "zh": "四种关系价值完全并列"}, "headings": {"en": ["Read every tied direction", "Compare situations and tradeoffs", "Willingness and optional action", "A fictional situation to compare", "What the example cannot justify", "An optional private exercise", "Keep the count within its limits"], "zh": ["各并列方向的次数读法", "比较具体情境与取舍", "双方意愿与可选行动", "一个可比较的虚构情境", "这个例子不能支持什么", "可以只在私人纸页上练习", "原始次数的适用边界"]}}, {"answers": ["o2", "o2", "o1", "o2", "o2", "o1", "o2", "o1", "o2", "o1", "o1", "o2", "o2", "o1", "o1", "o2", "o1", "o2", "o1", "o2", "o2", "o1", "o2", "o1"], "counts": [5, 7, 6, 6], "profileId": "practical-partnership", "sections": 7, "title": {"en": "Practical Partnership", "zh": "务实协作与共同建设"}, "headings": {"en": ["What these choices concern", "Check a specific experience", "An optional, negotiable step", "A fictional situation to compare", "What the example cannot justify", "An optional private exercise", "Keep the count within its limits"], "zh": ["这些选项具体涉及什么", "带回具体经历核对", "可协商的小步骤", "一个可比较的虚构情境", "这个例子不能支持什么", "可以只在私人纸页上练习", "原始次数的适用边界"]}}, {"answers": ["o1", "o2", "o1", "o2", "o2", "o1", "o2", "o1", "o1", "o2", "o1", "o2", "o1", "o2", "o1", "o2", "o1", "o2", "o1", "o2", "o2", "o1", "o2", "o1"], "counts": [8, 8, 4, 4], "profileId": "rituals-cooperation-tie", "sections": 7, "title": {"en": "Rituals and Cooperation Tied", "zh": "仪式与协作并列"}, "headings": {"en": ["Read every tied direction", "Compare situations and tradeoffs", "Willingness and optional action", "A fictional situation to compare", "What the example cannot justify", "An optional private exercise", "Keep the count within its limits"], "zh": ["各并列方向的次数读法", "比较具体情境与取舍", "双方意愿与可选行动", "一个可比较的虚构情境", "这个例子不能支持什么", "可以只在私人纸页上练习", "原始次数的适用边界"]}}, {"answers": ["o2", "o2", "o1", "o2", "o2", "o1", "o2", "o1", "o1", "o2", "o1", "o2", "o2", "o1", "o1", "o2", "o1", "o2", "o1", "o2", "o1", "o1", "o2", "o1"], "counts": [7, 7, 7, 3], "profileId": "rituals-cooperation-companionship-tie", "sections": 7, "title": {"en": "Rituals, Cooperation and Companionship Tied", "zh": "仪式、协作与陪伴并列"}, "headings": {"en": ["Read every tied direction", "Compare situations and tradeoffs", "Willingness and optional action", "A fictional situation to compare", "What the example cannot justify", "An optional private exercise", "Keep the count within its limits"], "zh": ["各并列方向的次数读法", "比较具体情境与取舍", "双方意愿与可选行动", "一个可比较的虚构情境", "这个例子不能支持什么", "可以只在私人纸页上练习", "原始次数的适用边界"]}}];
describe("individual relationship values editorial",()=>{
  it("uses four interaction entries and a dialogue check",()=>{ const html=renderToStaticMarkup(<DiscoveryCardArt slug="relationship-values" category="relationships"/>); expect(html).toContain('data-composition="relationship-shared-table:relationship-personal-paths:workspace"'); expect(html).toContain('data-relationship-shared-table="true"');expect(html).toContain('data-relationship-personal-paths="true"'); });
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
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale==="zh"?"爱情阵营测试测什么？四类关系价值与情境选择":"What does the Relationship Values Test explore? Four themes in context");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      expect(dom.querySelector('[aria-labelledby="questionnaire-method"]')?.textContent).toContain(quiz.guide.find(s=>s.id==="raw-wins-explanation")!.paragraphs[0][locale]);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...relationshipValuesLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...relationshipValuesLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2])expect(dom.querySelector(`a[href="#relationship-values-reference-${n}"]`)).not.toBeNull();
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
