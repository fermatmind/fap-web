import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QuestionnaireIntimacyClient } from "@/components/questionnaires/QuestionnaireIntimacyClient";
import { QuestionnaireIntimacyReport } from "@/components/questionnaires/QuestionnaireIntimacyReport";
import { isMiniIntimacyConfigurationValid, scoreMiniIntimacyQuestionnaire, type MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/intimacy-preference-test.json","utf8")) as MiniIntimacyQuestionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
function complete(answers:Record<string,string>){const result=scoreMiniIntimacyQuestionnaire(quiz,answers);if(result.status!=="complete")throw new Error(result.status);return result;}
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};

describe("four separate adult preference guides without a new score, type or permission",()=>{
 it("preserves strict raw configuration and all original bilingual paragraphs with idempotent reading preparation",()=>{
  const before=JSON.stringify(quiz);expect(isMiniIntimacyConfigurationValid(quiz)).toBe(true);expect(isMiniIntimacyConfigurationValid({...quiz,profiles:readings})).toBe(false);
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
   const reader=d.querySelector(`[data-intimacy-preference-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(8);expect(reader.querySelectorAll("section > p")).toHaveLength(19);expect(reader.querySelectorAll(`nav[aria-label="${locale === "zh" ? "结果解读目录" : "Result reading contents"}"] a`)).toHaveLength(8);
   for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
   for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);
   expect(d.querySelector("input,textarea,[data-intimacy-mean],[data-intimacy-sum]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
  }
 });
 it("keeps every possible group sum and four-decimal mean beside all four complete projected guides",()=>{
  let checked=0;
  for(let group=0;group<4;group++)for(let sum=6;sum<=30;sum++){
   const answers=base();let remainder=sum-6;for(let i=0;i<6;i++){const extra=Math.min(remainder,4);remainder-=extra;answers[quiz.questions[group*6+i].id]=String(1+extra);}
   const result=complete(answers),d=dom(renderToStaticMarkup(<QuestionnaireIntimacyReport quiz={quiz} result={result} readingProfiles={readings} locale="en"/>));
   const part=d.querySelector(`[data-intimacy-part="${quiz.directions[group].id}"]`)!;expect(part.querySelector("[data-intimacy-sum]")?.textContent).toContain(String(sum));expect(part.querySelector("[data-intimacy-mean]")?.textContent).toContain((sum/6).toFixed(4));
   expect(d.querySelectorAll("[data-intimacy-preference-result-reading]")).toHaveLength(4);expect(d.querySelectorAll("[data-intimacy-preference-result-reading] section > p")).toHaveLength(76);checked++;
  }
  expect(checked).toBe(100);
  for(const locale of ["en","zh"]as const)for(const group of [-1,0,1,2,3]){
   const answers=group<0?Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])):base();if(group>=0)answers[quiz.questions[group*6].id]="na";
   const d=dom(renderToStaticMarkup(<QuestionnaireIntimacyReport quiz={quiz} result={complete(answers)} readingProfiles={readings} locale={locale}/>));expect(d.querySelectorAll("[data-intimacy-sum]")).toHaveLength(group<0?0:3);expect(d.querySelectorAll("[data-intimacy-preference-result-reading]")).toHaveLength(4);
   const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  }
 });
 it("uses original report content when a reading carries mismatched direction, product or profile identity",()=>{
  const p=readings[0],result=complete(base());
  for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]){
   const d=dom(renderToStaticMarkup(<QuestionnaireIntimacyReport quiz={quiz} result={result} readingProfiles={bad} locale="en"/>));expect(d.querySelector("[data-intimacy-preference-result-reading]")).toBeNull();expect(d.querySelectorAll('[data-intimacy-part="emotional-sharing"] section > p')).toHaveLength(16);
  }
 });
 it("runs the strict native client with projected readings and keeps answers out of copying and persistence",async()=>{
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});const writeText=vi.fn().mockRejectedValue(new Error("denied"));Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
  const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");const {container}=render(<QuestionnaireIntimacyClient quiz={quiz} readingProfiles={readings} locale="en"/>);
  fireEvent.click(screen.getByRole("button",{name:"Start test"}));
  for(let i=0;i<24;i++){fireEvent.click(container.querySelector(`input[value="${i===0?"na":"3"}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===23?"See four parts":"Next"}));}
  expect(container.querySelectorAll("[data-intimacy-preference-result-reading]")).toHaveLength(4);expect(container.querySelectorAll("[data-intimacy-sum]")).toHaveLength(3);
  await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Copy public explanation links"})));
  const payload=quiz.profiles.map(p=>`${p.title.en}\nhttps://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`).join("\n\n");expect(writeText).toHaveBeenCalledWith(payload);expect(screen.getByLabelText("Public links for manual copying")).toHaveValue(payload);
  fireEvent.click(screen.getByRole("button",{name:"Retake with empty answers"}));expect(container.querySelector("[data-intimacy-result]")).toBeNull();expect(container.querySelector("input:checked")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Exit and clear these responses"}));expect(screen.getByRole("button",{name:"Start test"})).toBeVisible();expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
 });
});
