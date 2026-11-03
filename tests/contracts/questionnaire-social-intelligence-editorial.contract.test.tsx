import { socialIntelligenceLandingSections, socialIntelligenceLandingFaq } from "@/components/questionnaires/SocialIntelligenceLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/social-intelligence-test.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireSocialReport } from "@/components/questionnaires/QuestionnaireSocialReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual four-item social-intelligence editorial", () => {
  it("reproduces published examples and the exact mean without reconstructing a rounded value", () => {
    for (const [ratings, sum, rated, displayed] of [
      [["1","5","3","4"],7,4,"1.75 / 5"],
      [["4","2","3","1"],16,4,"4.00 / 5"],
      [["5","5","5","5"],12,4,"3.00 / 5"],
      [["4","2","3","na"],11,3,"Insufficient information"],
      [["na","na","na","na"],0,0,"Insufficient information"],
    ] as const) {
      const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,ratings[i]]));
      const result = scoreQuestionnaire(quiz,answers);
      if (result.status !== "complete" || !("facets" in result)) throw new Error("Example rejected");
      expect(result.facets["social-intelligence"]).toEqual({sum,rated,total:4,mean:rated===4?Math.round(sum/4*10)/10:null});
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireSocialReport quiz={quiz} locale="en" result={result} />);
      expect(dom.querySelector("[data-social-mean]")?.textContent).toBe(displayed);
      expect(dom.querySelectorAll("[data-social-profile] h4")).toHaveLength(9);
    }
  });
  it("renders all bilingual readings, fourteen FAQs and resolving primary citations", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh","en"] as const) {
      const dom=document.createElement("div");
      dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(text:string)=>text.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
      const body=normalize(dom.textContent??"");
      for(const faq of socialIntelligenceLandingFaq)expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...socialIntelligenceLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      for(const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2,3,4])expect(dom.querySelector(`a[href="#social-intelligence-test-reference-${n}"]`)).not.toBeNull();
      expect(body).toContain(locale==="zh"?"7÷4＝1.75":"7÷4=1.75");
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
