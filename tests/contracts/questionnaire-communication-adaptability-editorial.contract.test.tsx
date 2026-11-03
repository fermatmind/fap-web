import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { communicationAdaptabilityLandingSections, communicationAdaptabilityLandingFaq } from "@/components/questionnaires/CommunicationAdaptabilityLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/communication-adaptability.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders an audience message and a retrievable record as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="communication-adaptability" category="framework" />);
  for(const motif of ["comm-audience-message","comm-channel-record"])expect(html).toContain(`data-${motif}="true"`);
});
it("checks a fresh literal-key example against five six-case counts", () => {
  const keys="cadbbdcadabcaccbdabdacdbcbadbc".split("");
  expect(keys).toHaveLength(30);
  expect(quiz.questions.map(q=>q.correctOptionId)).toEqual(keys);
  const expected=[2,5,1,4,3];
  const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i%6<expected[Math.floor(i/6)]?keys[i]:keys[i]==="a"?"b":"a"]));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("practice"in result))throw Error("Wrong result");
  expect(result.practice.correct).toBe(15);expect(Object.values(result.practice.sections).map(s=>s.correct)).toEqual(expected);
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
    for(const s of [...quiz.guide,...communicationAdaptabilityLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...communicationAdaptabilityLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3])expect(dom.querySelector(`#communication-adaptability-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
