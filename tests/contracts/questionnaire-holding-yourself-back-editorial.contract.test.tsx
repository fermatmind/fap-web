import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { holdingLandingSections, holdingLandingFaq } from "@/components/questionnaires/HoldingLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/holding-yourself-back.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders seven equal check-ins and a concrete next-action note", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="everyday" />);
  for(const motif of ["holding-seven-checkins","holding-next-action"])expect(html).toContain(`data-${motif}="true"`);
});
it("keeps seven worked means in source order and withholds only the skipped topic", () => {
  const values=[[5,1,4,2,5],[2,4,1,3,4],[4,2,5,1,3],[1,2,1,3,2],[5,4,3,5,4],[2,3,4,1,3],[4,5,2,4,3]].flat();
  const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,String(values[i])]));
  const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("holdingBack35"in r))throw Error("Wrong result");return r;};
  const result=complete(answers);expect(result.holdingBack35.domains.map(d=>d.mean)).toEqual([3.4,2.8,3,1.8,4.2,2.6,3.6]);
  expect(result.holdingBack35.domains.map(d=>d.domainId)).toEqual(quiz.directions.map(d=>d.id));
  const skip=complete({...answers,"emotion-recovery-4":"na"});expect(skip.holdingBack35.domains[0]).toEqual({domainId:"emotion-recovery",numericCount:4,requiredNumeric:5,mean:null});
  expect(skip.holdingBack35.domains.slice(1)).toEqual(result.holdingBack35.domains.slice(1));
  expect(Object.keys(result.holdingBack35)).toEqual(["method","domains"]);
});
it("renders fourteen bilingual FAQs, seven guide links and all original plus new reading text", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(7);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...holdingLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...holdingLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3])expect(dom.querySelector(`#${quiz.slug}-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
