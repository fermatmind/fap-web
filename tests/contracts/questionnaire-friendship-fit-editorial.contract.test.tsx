import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { friendshipFitLandingSections, friendshipFitLandingFaq } from "@/components/questionnaires/FriendshipFitLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/friendship-compatibility.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders two invitations and a shared optional plan as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="friendship-compatibility" category="framework" />);
  for(const motif of ["friendfit-two-invitations","friendfit-shared-plan"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh mean without a winner and isolates missing information", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  [5,2,1,5].forEach((v,i)=>answers[`FRIENDFIT_${String(i+1).padStart(2,"0")}`]=String(v));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("facets"in result))throw Error("Wrong result");
  expect(result.facets["agreements-and-priorities"]).toEqual({sum:13,rated:4,total:4,mean:3.3});
  expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("leaders");
  const missing=scoreQuestionnaire(quiz,{...answers,FRIENDFIT_02:"na"});
  if(missing.status!=="complete"||!("facets"in missing))throw Error("Wrong result");
  expect(missing.facets["agreements-and-priorities"]).toEqual({sum:11,rated:3,total:4,mean:null});
  expect(missing.facets["room-to-speak"].mean).toBe(3);
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(10);
    for(const s of [...quiz.guide,...friendshipFitLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...friendshipFitLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4])expect(dom.querySelector(`#friendship-compatibility-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
