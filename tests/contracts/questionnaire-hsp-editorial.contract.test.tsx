import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { hspLandingSections, hspLandingFaq } from "@/components/questionnaires/HspLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/hsp-sensitivity-quiz.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders four six-item records and open interpretation as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="hsp-sensitivity-quiz" category="framework" />);
  for(const motif of ["hsp-four-context-notes","hsp-open-interpretation"])expect(html).toContain(`data-${motif}="true"`);
});
it("distinguishes a complete mean from five numeric responses and no occasions", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  [5,1,2,4,3,4].forEach((v,i)=>answers[`SEXP_${String(i+1).padStart(2,"0")}`]=String(v));
  const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("facets"in r))throw Error("Wrong result");return r;};
  expect(complete(answers).facets["reflective-meaning"]).toEqual({sum:19,rated:6,total:6,mean:3.2});
  const skip=complete({...answers,SEXP_02:"na"});expect(skip.facets["reflective-meaning"]).toEqual({sum:18,rated:5,total:6,mean:null});expect(skip.facets["busy-input"].mean).toBe(3);
  expect(complete(answers)).not.toHaveProperty("leaders");expect(complete(answers)).not.toHaveProperty("total");
  const missing={...answers};delete missing.SEXP_24;expect(scoreQuestionnaire(quiz,missing)).toEqual({status:"incomplete",answered:23});
});
it("renders fifteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(15);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...hspLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...hspLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4])expect(dom.querySelector(`#hsp-sensitivity-quiz-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body.replaceAll("睇电视", "")).not.toMatch(/\p{Script=Han}/u);
  }
});
