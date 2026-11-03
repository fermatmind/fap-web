import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { ctlLandingSections, ctlLandingFaq } from "@/components/questionnaires/CtlLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/capacity-to-love-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders six source cards and reverse key as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="capacity-to-love-test" category="framework" />);
  for(const motif of ["ctl-six-source-cards","ctl-reverse-key"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates a fresh reversed-item example and requires every valid response", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"2"]));
  [4,2,1,3,4,1,2].forEach((v,i)=>answers[`CTL2018_${String(i+1).padStart(2,"0")}`]=String(v));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("ctl41"in result))throw Error("Wrong result");
  expect(result.ctl41[0]).toEqual({id:"INT",profileId:"interest-reading",rawSum:18,itemCount:7,mean:18/7});
  expect(result).not.toHaveProperty("leaders");expect(result).not.toHaveProperty("total");
  const missing={...answers};delete missing.CTL2018_41;
  expect(scoreQuestionnaire(quiz,missing)).toEqual({status:"incomplete",answered:40});
  expect(scoreQuestionnaire(quiz,{...answers,CTL2018_41:"na"}).status).toBe("invalid");
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(6);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(11);
    for(const s of [...quiz.guide,...ctlLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...ctlLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));expect(dom.querySelectorAll("[data-ctl41-attribution]")).toHaveLength(1);expect(dom.querySelector(".explore-intro [data-ctl41-attribution]")).toBeNull();expect(dom.querySelector("[data-ctl41-attribution]")?.textContent).toContain("CC BY 4.0");
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3])expect(dom.querySelector(`#capacity-to-love-test-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
