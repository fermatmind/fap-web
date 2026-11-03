import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { parentingLandingSections, parentingLandingFaq } from "@/components/questionnaires/ParentingLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/parenting-style.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders listening pair and routine steps as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="parenting-style" category="relationships" />);
  for(const motif of ["parenting-listening-pair","parenting-routine-steps"])expect(html).toContain(`data-${motif}="true"`);
});
it("keeps the fresh 3.5 and 3.2 means independent without assigning a style", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  [5,1,4,2,5,4,2,4,3,1,4,5].forEach((v,i)=>answers[`PCARE_${String(i+1).padStart(2,"0")}`]=String(v));
  const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("facets"in r))throw Error("Wrong result");return r;};
  expect(complete(answers).facets["warm-response"]).toEqual({sum:21,rated:6,total:6,mean:3.5});
  expect(complete(answers).facets["clear-boundaries"]).toEqual({sum:19,rated:6,total:6,mean:3.2});
  const skip=complete({...answers,PCARE_04:"na"});expect(skip.facets["warm-response"]).toEqual({sum:19,rated:5,total:6,mean:null});expect(skip.facets["clear-boundaries"].mean).toBe(3.2);
  expect(complete(answers)).not.toHaveProperty("leaders");expect(complete(answers)).not.toHaveProperty("total");
  const missing={...answers};delete missing.PCARE_12;expect(scoreQuestionnaire(quiz,missing)).toEqual({status:"incomplete",answered:11});
});
it("renders sixteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(16);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(10);
    for(const s of [...quiz.guide,...parentingLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...parentingLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5])expect(dom.querySelector(`#parenting-style-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
