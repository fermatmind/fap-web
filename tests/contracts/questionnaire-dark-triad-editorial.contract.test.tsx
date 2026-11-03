import { darkTriadLandingSections, darkTriadLandingFaq } from "@/components/questionnaires/DarkTriadLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/dark-triad.json";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireDarkTriadReport } from "@/components/questionnaires/QuestionnaireDarkTriadReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual eighteen-item Dark Triad thematic editorial", () => {
  it("reproduces four-, three- and six-rated examples while keeping all guides and exact means", () => {
    const mixed=["1","2","2","2","na","na","4","4","4","na","na","na","1","1","1","2","2","3"];
    for(const mode of ["mixed","three","five","na"] as const){
      const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,mode==="mixed"?mixed[i]:mode==="three"?"3":mode==="five"?"5":"na"]));
      const result=scoreLikertQuestionnaire(quiz,answers);
      if(result.status!=="complete")throw new Error("Complete example rejected");
      const facets=Object.values(result.facets);
      expect(facets.map(f=>f.rated)).toEqual(mode==="mixed"?[4,3,6]:Array(3).fill(mode==="na"?0:6));
      expect(facets.map(f=>f.sum)).toEqual(mode==="mixed"?[7,12,10]:Array(3).fill(mode==="na"?0:mode==="three"?18:30));
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total");
      for(const locale of ["zh","en"] as const){
        const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireDarkTriadReport quiz={quiz} locale={locale} result={result}/>);
        const missing=locale==="zh"?"资料不足":"Insufficient information";
        expect(Array.from(dom.querySelectorAll("[data-dtt-mean]"),e=>e.textContent)).toEqual(mode==="mixed"?["1.75 / 5",missing,"1.67 / 5"]:Array(3).fill(mode==="na"?missing:mode==="three"?"3.00 / 5":"5.00 / 5"));
        expect(dom.querySelectorAll("[data-dtt-profile] h4")).toHaveLength(27);
        expect(dom.querySelectorAll("[data-dtt-sum]")).toHaveLength(mode==="na"?0:mode==="mixed"?2:3);
      }
    }
  });
  it("renders every original and supplementary bilingual paragraph, fourteen FAQs and primary citations",async()=>{
    const entry=await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for(const locale of ["zh","en"] as const){
      const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(3);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();const body=normalize(dom.textContent??"");
      for(const faq of [...quiz.faq,...darkTriadLandingFaq])expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...darkTriadLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      const citations=dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation");expect(citations.length).toBeGreaterThan(0);
      for(const citation of citations)expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#dark-triad-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale==="zh"?"7÷4＝1.75":"7÷4=1.75");
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
