import { egogramLandingSections, egogramLandingFaq } from "@/components/questionnaires/EgogramLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/egogram.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireEgogramReport } from "@/components/questionnaires/QuestionnaireEgogramReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual five-group egogram editorial", () => {
  it("reproduces separate raw sums, exact means and one missing group without losing any guide", () => {
    const patterns = [["1","1","2","3"],["1","1","5","5"],["4","4","4","4"],["5","5","5","5"],["4","4","4","na"]];
    const answers = Object.fromEntries(quiz.directions.flatMap((d,i)=>quiz.questions.filter(q=>q.options[0].directionId===d.id).map((q,j)=>[q.id,patterns[i][j]])));
    const result = scoreQuestionnaire(quiz,answers);
    if(result.status!=="complete"||!("facets" in result))throw new Error("Example rejected");
    expect(quiz.directions.map(d=>result.facets[d.id].sum)).toEqual([7,12,16,20,12]);
    const dom=document.createElement("div");
    dom.innerHTML=renderToStaticMarkup(<QuestionnaireEgogramReport quiz={quiz} locale="en" result={result} />);
    expect([...dom.querySelectorAll("[data-ego-mean]")].map(e=>e.textContent)).toEqual(["1.75 / 5","3.00 / 5","4.00 / 5","5.00 / 5","Insufficient information"]);
    expect(dom.querySelectorAll("[data-ego-bar]")).toHaveLength(4);
    expect(dom.querySelectorAll("[data-ego-profile] h4")).toHaveLength(45);
    for(const field of ["total","leaders","profileId","energy","dominantState"])expect(result).not.toHaveProperty(field);
  });
  it("renders all bilingual readings, fourteen FAQs and resolving primary citations", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item=>item.slug===quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh","en"] as const) {
      const dom=document.createElement("div");
      dom.innerHTML=renderToStaticMarkup(await entry.default({params:Promise.resolve({slug:quiz.slug,locale})}));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(5);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize=(text:string)=>text.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
      const body=normalize(dom.textContent??"");
      for(const faq of egogramLandingFaq)expect(body).toContain(normalize(faq.answer[locale]));
      for(const section of [...quiz.guide,...egogramLandingSections])for(const paragraph of section.paragraphs)expect(body).toContain(normalize(paragraph[locale]));
      for(const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      for(const n of [1,2,3,4])expect(dom.querySelector(`a[href="#egogram-reference-${n}"]`)).not.toBeNull();
      expect(body).toContain(locale==="zh"?"7÷4＝1.75":"7÷4=1.75");
      if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
