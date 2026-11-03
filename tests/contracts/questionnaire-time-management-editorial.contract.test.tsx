import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { timeManagementLandingSections, timeManagementLandingFaq } from "@/components/questionnaires/TimeManagementLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/time-management.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders capacity blocks and a return cue as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="time-management" category="framework" />);
  for(const motif of ["time-capacity-blocks","time-return-cue"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh reversed example, shared means and part-specific missing", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  [5,2,4,3,5,1].forEach((v,i)=>{answers[quiz.questions[i].id]=String(v);});
  const result=scoreQuestionnaire(quiz,answers);expect(result.status).toBe("complete");
  if(result.status!=="complete"||!("facets"in result))throw Error("Wrong result");
  expect(result.facets.priorities).toEqual({sum:22,rated:6,total:6,mean:3.7});
  expect(result.facets.planning.mean).toBe(3);
  const skipped=scoreQuestionnaire(quiz,{...answers,TMH_06:"na"});
  if(skipped.status!=="complete"||!("facets"in skipped))throw Error("Wrong result");
  expect(skipped.facets.priorities.mean).toBeNull();expect(skipped.facets.planning.mean).toBe(3);
  expect([1,1,1,5,5,5].reduce((a,b)=>a+b,0)/6).toBe(3);
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(9);
    for(const s of [...quiz.guide,...timeManagementLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...timeManagementLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3])expect(dom.querySelector(`#time-management-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
