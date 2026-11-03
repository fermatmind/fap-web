import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { annoyingLandingSections, annoyingLandingFaq } from "@/components/questionnaires/AnnoyingLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/annoying-person-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders context cards and a personal boundary as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="annoying-person-test" category="framework" />);
  for(const motif of ["friction-context-cards","friction-personal-boundary"])expect(html).toContain(`data-${motif}="true"`);
});
it("keeps numeric uncertainty, exact means and all-or-nothing completeness", () => {
 const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
 [5,1,4,5].forEach((v,i)=>answers[`DISLIKED_LK_${String(i+1).padStart(3,"0")}`]=String(v));
 const result=scoreQuestionnaire(quiz,answers);if(result.status!=="complete"||!("miniFriction"in result))throw Error("Wrong result");
 expect(result.miniFriction[0]).toMatchObject({rawSum:15,mean:3.75});expect(result.miniFriction[1].mean).toBe(3);
 delete answers.DISLIKED_LK_002;expect(scoreQuestionnaire(quiz,answers)).toEqual({status:"incomplete",answered:19});
 expect(scoreQuestionnaire(quiz,{...answers,DISLIKED_LK_002:"na"}).status).toBe("invalid");
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(12);
    for(const s of [...quiz.guide,...annoyingLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...annoyingLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2])expect(dom.querySelector(`#annoying-person-test-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
