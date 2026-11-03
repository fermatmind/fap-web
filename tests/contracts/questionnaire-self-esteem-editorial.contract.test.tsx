import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { selfEsteemLandingSections, selfEsteemLandingFaq } from "@/components/questionnaires/SelfEsteemLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreRosenbergQuestionnaire } from "@/lib/questionnaires/rosenberg";
import raw from "@/lib/questionnaires/data/self-esteem.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders ten contributions and one total as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="self-esteem" category="framework" />);
  for(const motif of ["rses-ten-contributions","rses-one-total"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates the new example and distinguishes valid zero from missing", () => {
  const contributions=[3,1,2,0,1,3,2,2,0,3],keys=["sa","a","d","sd"];
  const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,keys[3-(q.reverse?3-contributions[i]:contributions[i])]]));
  expect(scoreRosenbergQuestionnaire(quiz,answers)).toMatchObject({status:"complete",rosenberg:{total:17}});
  const zeros=Object.fromEntries(quiz.questions.map(q=>[q.id,q.reverse?"sa":"sd"]));
  expect(scoreRosenbergQuestionnaire(quiz,zeros)).toMatchObject({rosenberg:{total:0}});
  expect(scoreRosenbergQuestionnaire(quiz,{...zeros,RSES_01:"na"})).toMatchObject({rosenberg:{total:null,rated:9}});
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(1);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...selfEsteemLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...selfEsteemLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5,6])expect(dom.querySelector(`#self-esteem-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
