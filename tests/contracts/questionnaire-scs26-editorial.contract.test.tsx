import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { scs26LandingSections, scs26LandingFaq } from "@/components/questionnaires/Scs26LandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/self-compassion.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders six equal parts and a reflection note as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="self-compassion" category="framework" />);
  for(const motif of ["scs-six-balanced-parts","scs-reflection-note"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh reversed example, shared means and part-specific missing", () => {
  const groups=[[5,12,19,23,26],[1,8,11,16,21],[3,7,10,15],[4,13,18,25],[9,14,17,22],[2,6,20,24]];
  const raw=[[5,2,4,3,3],[4,2,5,1,4],[4,2,3,4],[1,2,1,3],[2,4,1,3],[2,1,4,2]];
  const answers:Record<string,string>={};groups.forEach((g,i)=>g.forEach((n,j)=>answers[`SCS_${String(n).padStart(2,"0")}`]=String(raw[i][j])));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("scs26"in result))throw Error("Wrong result");
  expect(result.scs26.overallNumerator).toBe(399);expect(result.scs26.overallMean).toBe(3.325);
  expect(Object.values(result.scs26.parts).map(x=>x.rawSum)).toEqual([17,16,13,7,10,9]);
  expect(Object.values(result.scs26.parts).map(x=>x.keyedMean)).toEqual([3.4,2.8,3.25,4.25,2.5,3.75]);
  const skipped=scoreQuestionnaire(quiz,{...answers,SCS_01:"na"});
  if(skipped.status!=="complete"||!("scs26"in skipped))throw Error("Wrong result");
  expect(skipped.scs26.overallMean).toBeNull();expect(skipped.scs26.parts["self-judgment"].rawMean).toBeNull();
  expect(skipped.scs26.parts["self-kindness"].rawMean).toBe(3.4);
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(7);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(9);
    for(const s of [...quiz.guide,...scs26LandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...scs26LandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5])expect(dom.querySelector(`#self-compassion-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
