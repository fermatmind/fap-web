import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { sapsLandingSections, sapsLandingFaq } from "@/components/questionnaires/SapsLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/perfectionism.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders a task requirement and its separate review as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="perfectionism" category="framework" />);
  for(const motif of ["saps-required-refined","saps-observed-reviewed"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh mean without a winner and isolates missing information", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
  const values=[1,7,6,2,3,5,7,1];quiz.questions.forEach((q,i)=>answers[q.id]=String(values[i]));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("sapsDomains"in result))throw Error("Wrong result");
  expect(result.sapsDomains.standards).toEqual({sum:17,rated:4,total:4,mean:4.25});
  expect(result.sapsDomains.discrepancy).toEqual({sum:15,rated:4,total:4,mean:3.75});
  expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("leaders");
  const partial={...answers};delete partial["saps-02"];
  expect(scoreQuestionnaire(quiz,partial)).toEqual({status:"incomplete",answered:7});
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    expect(dom.querySelector(".explore-intro [data-saps-attribution]")).toBeNull();
    expect(dom.querySelector("[data-saps-attribution]")).not.toBeNull();
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(2);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...sapsLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...sapsLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4])expect(dom.querySelector(`#perfectionism-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
