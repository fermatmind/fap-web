import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QuestionnaireCopingClient } from "@/components/questionnaires/QuestionnaireCopingClient";
import { QuestionnaireCopingReport } from "@/components/questionnaires/QuestionnaireCopingReport";
import { isMiniCopingConfigurationValid, scoreMiniCopingQuestionnaire, type MiniCopingQuestionnaire } from "@/lib/questionnaires/miniCoping";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/coping-rhythm-test.json","utf8")) as MiniCopingQuestionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"A"]));
function complete(answers:Record<string,string>){const result=scoreMiniCopingQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error(result.status);return result;}
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};

describe("four paired coping guides without an age, trait-strength or overall score",()=>{
 it("preserves strict raw configuration and all original bilingual paragraphs with idempotent reading preparation",()=>{
  const before=JSON.stringify(quiz);expect(isMiniCopingConfigurationValid(quiz)).toBe(true);expect(isMiniCopingConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const [i,p]of readings.entries()){
   expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);
   expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(19);
   for(const [j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);
  }
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"unknown"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all eight real public guide callers with full additions, working anchors and no personal values",async()=>{
  const {default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const locale of ["en","zh"]as const)for(const p of readings){
   const d=dom(renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));
   const reader=d.querySelector(`[data-coping-rhythm-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(8);expect(reader.querySelectorAll("section > p")).toHaveLength(19);expect(reader.querySelectorAll(`nav[aria-label="${locale === "zh" ? "结果解读目录" : "Result reading contents"}"] a`)).toHaveLength(8);
   for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
   for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);
   expect(d.querySelector("input,textarea,[data-coping-count],[data-coping-pair]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
  }
 });
 it("retains all seven possible marginal counts, ties and both full poles beside projected readings",()=>{
  let checked=0;
  for(let group=0;group<4;group++)for(let count=0;count<=6;count++){
   const answers=base(),profile=quiz.profiles[group];
   for(let i=0;i<6;i++){const q=quiz.questions[group*6+i];answers[q.id]=q.options.find(o=>o.directionId===profile.directionIds[i<count?0:1])!.id;}
   const result=complete(answers),d=dom(renderToStaticMarkup(<QuestionnaireCopingReport quiz={quiz} result={result} readingProfiles={readings} locale="en"/>));
   const part=d.querySelector(`[data-coping-pair="${result.interactionPairs[group].id}"]`)!;
   expect([...part.querySelectorAll("[data-coping-count]")].map(n=>n.textContent)).toEqual([`${count} / 6`,`${6-count} / 6`]);
   expect(part.querySelector("[data-coping-tie]")?.getAttribute("data-coping-tie")).toBe(String(count===3));
   expect(d.querySelectorAll("[data-coping-rhythm-result-reading]")).toHaveLength(4);expect(d.querySelectorAll("[data-coping-rhythm-result-reading] section > p")).toHaveLength(76);checked++;
  }
  expect(checked).toBe(28);
  for(const locale of ["en","zh"]as const)for(const value of ["A","B"]){
   const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,value]));
   const d=dom(renderToStaticMarkup(<QuestionnaireCopingReport quiz={quiz} result={complete(answers)} readingProfiles={readings} locale={locale}/>));
   expect(d.querySelectorAll('[data-coping-tie="true"]')).toHaveLength(4);expect(d.querySelectorAll("[data-coping-rhythm-result-reading]")).toHaveLength(4);
   const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  }
 });
 it("uses original report content when a reading carries mismatched direction, product or profile identity",()=>{
  const p=readings[0],result=complete(base());
  for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,directionIds:[p.directionIds[0],"other"]}],[{...p,directionIds:[...p.directionIds].reverse()}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]){
   const d=dom(renderToStaticMarkup(<QuestionnaireCopingReport quiz={quiz} result={result} readingProfiles={bad} locale="en"/>));expect(d.querySelector("[data-coping-rhythm-result-reading]")).toBeNull();expect(d.querySelectorAll('[data-coping-pair="EXPLORATION_EVALUATION"] section > p')).toHaveLength(16);
  }
 });
 it("runs the strict native client with projected readings and keeps answers out of copying and persistence",async()=>{
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});const writeText=vi.fn().mockRejectedValue(new Error("denied"));Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
  const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");const {container}=render(<QuestionnaireCopingClient quiz={quiz} readingProfiles={readings} locale="en"/>);
  fireEvent.click(screen.getByRole("button",{name:"Start test"}));
  for(let i=0;i<24;i++){fireEvent.click(container.querySelector(`input[value="${"A"}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===23?"See four records":"Next"}));}
  expect(container.querySelectorAll("[data-coping-rhythm-result-reading]")).toHaveLength(4);expect(container.querySelectorAll('[data-coping-tie="true"]')).toHaveLength(4);
  await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Copy public explanation links"})));
  const payload=quiz.profiles.map(p=>`${p.title.en}\nhttps://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`).join("\n\n");expect(writeText).toHaveBeenCalledWith(payload);expect(screen.getByLabelText("Public links for manual copying")).toHaveValue(payload);
  fireEvent.click(screen.getByRole("button",{name:"Retake with empty answers"}));expect(container.querySelector("[data-coping-result]")).toBeNull();expect(container.querySelector("input:checked")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Exit and clear these responses"}));expect(screen.getByRole("button",{name:"Start test"})).toBeVisible();expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
 });
});
