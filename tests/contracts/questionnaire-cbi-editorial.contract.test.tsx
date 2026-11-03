import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { cbiLandingSections, cbiLandingFaq } from "@/components/questionnaires/CbiLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/burnout-risk.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders six and seven modules with independent readings as distinct artwork", () => {
  const html = renderToStaticMarkup(<DiscoveryCardArt slug="burnout-risk" category="framework" />);
  for(const motif of ["cbi-six-seven-modules","cbi-independent-readings"])expect(html).toContain(`data-${motif}="true"`);
});
it("recalculates fresh full and partial examples with source-specific minima", () => {
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));
  const set=(prefix:string,values:number[])=>values.forEach((v,i)=>{answers[`CBI_${prefix}_${String(i+1).padStart(2,"0")}`]=String(v);});
  set("P",[75,25,50,0,100,25]);set("W",[25,75,50,25,100,0,75]);
  const full=scoreQuestionnaire(quiz,answers);
  if(full.status!=="complete"||!("cbiDomains"in full))throw Error("Wrong result");
  expect(full.cbiDomains.personal.sum).toBe(275);expect(full.cbiDomains.personal.mean?.toFixed(2)).toBe("45.83");
  expect(full.cbiDomains.work.sum).toBe(300);expect(full.cbiDomains.work.mean?.toFixed(2)).toBe("42.86");
  const partial=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]));
  Object.assign(partial,{CBI_P_01:"75",CBI_P_02:"0",CBI_P_03:"25",CBI_W_01:"100",CBI_W_02:"50",CBI_W_03:"25",CBI_W_07:"100"});
  const scored=scoreQuestionnaire(quiz,partial);
  if(scored.status!=="complete"||!("cbiDomains"in scored))throw Error("Wrong result");
  expect(scored.cbiDomains.personal.mean?.toFixed(2)).toBe("33.33");expect(scored.cbiDomains.work.mean?.toFixed(2)).toBe("43.75");
  const below=scoreQuestionnaire(quiz,{...partial,CBI_P_03:"na",CBI_W_07:"na"});
  if(below.status!=="complete"||!("cbiDomains"in below))throw Error("Wrong result");
  expect(below.cbiDomains.personal.mean).toBeNull();expect(below.cbiDomains.work.mean).toBeNull();
});
it("renders fourteen bilingual FAQs, all original guide text and resolvable citations", async () => {
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g, "").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"] as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    expect(dom.querySelector(".explore-intro [data-cbi-attribution]")).toBeNull();
    expect(dom.querySelector("[data-cbi-attribution]")).not.toBeNull();
    expect(dom.querySelector("[data-cbi-attribution]")?.closest("details")).toBeNull();
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(2);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
    for(const s of [...quiz.guide,...cbiLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...cbiLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2,3,4,5,6,7])expect(dom.querySelector(`#burnout-risk-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
