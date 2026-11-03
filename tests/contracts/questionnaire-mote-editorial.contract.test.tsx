import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { moteLandingSections, moteLandingFaq } from "@/components/questionnaires/MoteLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import raw from "@/lib/questionnaires/data/mote-type.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
it("renders four dialogue cues and a bounded disclosure window", () => {
  const html=renderToStaticMarkup(<DiscoveryCardArt slug="mote-type" category="relationships" />);
  for(const motif of ["mote-four-dialogues","mote-disclosure-window"])expect(html).toContain(`data-${motif}="true"`);
});
it("keeps a fresh 5:1,2:4,3:3,1:5 example separate with no incomplete substitute", () => {
  const counts=[5,2,3,1];
  const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options.find(o=>o.directionId===quiz.directions[Math.floor(i/6)*2+(i%6<counts[Math.floor(i/6)]?0:1)].id)!.id]));
  const result=scoreQuestionnaire(quiz,answers);
  if(result.status!=="complete"||!("interactionPairs"in result))throw Error("Wrong result");
  for(let i=0;i<4;i++)expect(result.interactionPairs[i].counts).toEqual({[quiz.directions[i*2].id]:counts[i],[quiz.directions[i*2+1].id]:6-counts[i]});
  expect(result.interactionPairs.map(p=>p.leaders.length)).toEqual([1,1,2,1]);expect(result).not.toHaveProperty("profileId");expect(result).not.toHaveProperty("total");
  delete answers.ATTRACTION_PC_024;expect(scoreQuestionnaire(quiz,answers)).toEqual({status:"incomplete",answered:23});
});
it("renders fourteen bilingual FAQs, all original guide paragraphs and both source targets",async()=>{
  expect(catalog.find(q=>q.slug===quiz.slug)?.description).toEqual(quiz.description);
  const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
  for(const locale of ["en","zh"]as const){
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await QuestionnairePage({params:Promise.resolve({locale,slug:quiz.slug})}));
    const body=norm(dom.textContent??"");expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(4);
    expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(10);
    for(const s of [...quiz.guide,...moteLandingSections])for(const p of s.paragraphs)expect(body).toContain(norm(p[locale]));
    for(const f of [...quiz.faq,...moteLandingFaq]){expect(body).toContain(norm(f.question[locale]));expect(body).toContain(norm(f.answer[locale]));}
    expect(body).toContain(norm(quiz.instructions![locale]));
    for(const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
    for(const i of [1,2])expect(dom.querySelector(`#mote-type-reference-${i}`)).not.toBeNull();
    if(locale==="en")expect(body).not.toMatch(/\p{Script=Han}/u);
  }
});
