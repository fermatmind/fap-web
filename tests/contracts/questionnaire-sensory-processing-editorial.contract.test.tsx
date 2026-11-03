import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { spqLandingSections, spqLandingFaq } from "@/components/questionnaires/SpqLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/sensory-processing-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders perception records and reverse coding as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="sensory-processing-test" category="framework" />);
  for(const motif of ["spq-perception-record","spq-response-key"])expect(html).toContain(`data-${motif}="true"`);
});
it("computes a fresh full SPQ example without imputing an unscored item", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"1"]));
  const complete=(a:Record<string,string>)=>{const r=scoreQuestionnaire(quiz,a);if(r.status!=="complete"||!("spq92"in r))throw Error("Wrong result");return r;};
  expect(complete(answers).spq92).toEqual({rated:92,skipped:0,total:136});
  answers.SPQ92_01="3";answers.SPQ92_03="0";
  expect(complete(answers).spq92).toEqual({rated:92,skipped:0,total:139});
  expect(complete({...answers,SPQ92_53:"na"}).spq92).toEqual({rated:91,skipped:1,total:null});
  expect(complete(Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])) ).spq92).toEqual({rated:0,skipped:92,total:null});
  expect(complete(answers)).not.toHaveProperty("leaders");expect(complete(answers)).not.toHaveProperty("facets");
  const missing={...answers};delete missing.SPQ92_92;expect(scoreQuestionnaire(quiz,missing)).toEqual({status:"incomplete",answered:91});
});
it("renders fifteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(15);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(1);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(13);
    for(const s of [...quiz.guide,...spqLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...spqLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5,6])expect(dom.querySelector(`#sensory-processing-test-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
