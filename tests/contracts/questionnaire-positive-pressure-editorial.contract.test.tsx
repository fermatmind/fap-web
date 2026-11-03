import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { positivePressureLandingSections, positivePressureLandingFaq } from "@/components/questionnaires/PositivePressureLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/toxic-positivity-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders room for feelings and separate hopes and facts as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="toxic-positivity-test" category="framework" />);
  for(const motif of ["positive-room-for-feelings","positive-hope-facts"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh mean without a winner and isolates missing information", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  [4,2,5,1,3,4].forEach((v,i)=>answers[`TPOS_${String(i+1).padStart(2,"0")}`]=String(v));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("facets"in result))throw Error("Wrong result");
  expect(result.facets["self-pressure"]).toEqual({sum:13,rated:6,total:6,mean:2.2});
  expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("leaders");
  const missing=scoreQuestionnaire(quiz,{...answers,TPOS_02:"na"});
  if(missing.status!=="complete"||!("facets"in missing))throw Error("Wrong result");
  expect(missing.facets["self-pressure"]).toEqual({sum:11,rated:5,total:6,mean:null});
  expect(missing.facets["others-pressure"].mean).toBe(3);
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(3);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(11);
    for(const s of [...quiz.guide,...positivePressureLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...positivePressureLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3])expect(dom.querySelector(`#toxic-positivity-test-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
