import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QuestionnaireFourAxesClient } from "@/components/questionnaires/QuestionnaireFourAxesClient";
import { QuestionnaireFourAxesReport } from "@/components/questionnaires/QuestionnaireFourAxesReport";
import { isFourAxesConfigurationValid, scoreFourAxesQuestionnaire, type FourAxesQuestionnaire } from "@/lib/questionnaires/fourAxes";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/four-axes-test.json","utf8")) as FourAxesQuestionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"2"]));
function complete(answers:Record<string,string>){const result=scoreFourAxesQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error(result.status);return result;}
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};

describe("four original axis guides without inferred identities, clinical labels or ideology",()=>{
 it("preserves strict raw configuration and all original bilingual paragraphs with idempotent reading preparation",()=>{
  const before=JSON.stringify(quiz);expect(isFourAxesConfigurationValid(quiz)).toBe(true);expect(isFourAxesConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const [i,p]of readings.entries()){
   expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);
   expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(15);
   for(const [j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);
  }
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"unknown"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all eight real public guide callers with full additions, working anchors and no personal values",async()=>{
  const {default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const locale of ["en","zh"]as const)for(const p of readings){
   const d=dom(renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));
   const reader=d.querySelector(`[data-four-axes-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(6);expect(reader.querySelectorAll("section li")).toHaveLength(15);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(6);
   for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
   for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);
   expect(d.querySelector("input,textarea,[data-four-axes-sum],[data-four-axes-part]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
  }
 });
 it("retains all 244 marginal sums and both one-decimal range positions with four full readings",()=>{
  let checked=0;
  for(let group=0;group<4;group++)for(let sum=0;sum<=60;sum++){
   const answers=base();let remaining=sum;
   for(const q of quiz.questions.filter(q=>q.options[0].directionId===quiz.profiles[group].id)){const v=Math.min(4,remaining);remaining-=v;answers[q.id]=String(q.reverse?4-v:v);}
   const result=complete(answers),d=dom(renderToStaticMarkup(<QuestionnaireFourAxesReport quiz={quiz} result={result} readingProfiles={readings} locale="en"/>));
   const part=d.querySelector(`[data-four-axes-part="${quiz.profiles[group].id}"]`)!;expect(part.querySelector("[data-four-axes-sum]")?.textContent).toContain(`Raw sum: ${sum} / 60;`);
   const image=part.querySelector('[role="img"]')!;expect(image.getAttribute("aria-label")).toContain(`${(sum/60*100).toFixed(1)}%`);expect(image.getAttribute("aria-label")).toContain(`${(100-sum/60*100).toFixed(1)}%`);
   expect(d.querySelectorAll("[data-four-axes-result-reading]")).toHaveLength(4);expect(d.querySelectorAll("[data-four-axes-result-reading] section li")).toHaveLength(60);checked++;
  }
  expect(checked).toBe(244);
  for(const value of ["0","2","4"]){const result=complete(Object.fromEntries(quiz.questions.map(q=>[q.id,value])));expect(result.axes.gender.sum).toBe(value==="0"?28:value==="2"?30:32);}
 });
 it("uses original report content when a reading carries mismatched direction, product or profile identity",()=>{
  const p=readings[0],result=complete(base());
  for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,directionIds:[p.directionIds[0],"other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]){
   const d=dom(renderToStaticMarkup(<QuestionnaireFourAxesReport quiz={quiz} result={result} readingProfiles={bad} locale="en"/>));expect(d.querySelector("[data-four-axes-result-reading]")).toBeNull();expect(d.querySelectorAll('[data-four-axes-part="gender"] section li')).toHaveLength(12);
  }
 });
 it("runs the strict native client with projected readings and keeps answers out of copying and persistence",async()=>{
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});const writeText=vi.fn().mockRejectedValue(new Error("denied"));Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
  const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");const {container}=render(<QuestionnaireFourAxesClient quiz={quiz} readingProfiles={readings} locale="en"/>);
  fireEvent.click(screen.getByRole("button",{name:"Start test"}));
  for(let i=0;i<60;i++){fireEvent.click(container.querySelector(`input[value="2"]`)!);fireEvent.click(screen.getByRole("button",{name:i===59?"See four positions":"Next"}));}
  expect(container.querySelectorAll("[data-four-axes-result-reading]")).toHaveLength(4);expect(container.querySelectorAll('[data-four-axes-sum]')).toHaveLength(4);
  await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Copy public explanation links"})));
  const payload=quiz.profiles.map(p=>`${p.title.en}\nhttps://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`).join("\n\n");expect(writeText).toHaveBeenCalledWith(payload);expect(screen.getByLabelText("Public links for manual copying")).toHaveValue(payload);
  fireEvent.click(screen.getByRole("button",{name:"Retake with empty answers"}));expect(container.querySelector("[data-four-axes-result]")).toBeNull();expect(container.querySelector("input:checked")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Exit and clear these responses"}));expect(screen.getByRole("button",{name:"Start test"})).toBeVisible();expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
 });
});
