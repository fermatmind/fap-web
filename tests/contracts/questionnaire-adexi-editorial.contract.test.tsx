import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { adexiLandingSections, adexiLandingFaq } from "@/components/questionnaires/AdexiLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/executive-function.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders two keyed records and an optional stopping cue as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="executive-function" category="framework" />);
  for(const motif of ["adexi-two-keyed-records","adexi-action-cue"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates unequal parts and keeps the complete other part after a skip", () => {
  const wm=[1,2,5,7,8,9,11,12,13], inh=[3,4,6,10,14];
  const answers:Record<string,string>={};
  const id=(n:number)=>`ADEXI_${String(n).padStart(2,"0")}`;
  wm.forEach((n,i)=>answers[id(n)]=String([5,1,4,2,3,1,2,4,3][i]));
  inh.forEach((n,i)=>answers[id(n)]=String([1,2,4,3,2][i]));
  const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("adexi14"in r))throw Error("Wrong result");return r.adexi14;};
  expect(complete(answers).overallSum).toBe(37);
  expect(complete(answers).parts["working-memory"]).toEqual({rated:9,total:9,sum:25,mean:25/9});
  expect(complete(answers).parts.inhibition).toEqual({rated:5,total:5,sum:12,mean:12/5});
  const skipped=complete({...answers,ADEXI_02:"na"});
  expect(skipped.overallSum).toBeNull();expect(skipped.parts["working-memory"].mean).toBeNull();expect(skipped.parts.inhibition.sum).toBe(12);
  const other=complete({...answers,ADEXI_03:"na"});expect(other.parts.inhibition.sum).toBeNull();expect(other.parts["working-memory"].sum).toBe(25);
  const missing={...answers};delete missing.ADEXI_14;expect(scoreQuestionnaire(quiz,missing)).toEqual({status:"incomplete",answered:13});
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(3);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...adexiLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...adexiLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5,6])expect(dom.querySelector(`#executive-function-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body.replaceAll("睇电视", "")).not.toMatch(/\p{Script=Han}/u);
  }
});
