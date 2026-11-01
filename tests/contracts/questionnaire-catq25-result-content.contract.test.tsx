import { readFileSync } from "node:fs";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatQ25Client } from "@/components/questionnaires/CatQ25Client";
import { isCatQ25ConfigurationValid, scoreCatQ25, CATQ25_PART_KEYS, type CatQ25Questionnaire } from "@/lib/questionnaires/catq25";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/masking-test.json","utf8")) as CatQ25Questionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
beforeEach(()=>Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()}));
afterEach(cleanup);
const fixed=(v="4")=>Object.fromEntries(quiz.questions.map(q=>[q.id,v]));
function finish(container:HTMLElement,locale:"en"|"zh",answers:Record<string,string>=fixed()){
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始测试":"Start test"}));
 for(const[i,q]of quiz.questions.entries()){fireEvent.click(container.querySelector(`input[value="${answers[q.id]}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===24?(locale==="zh"?"查看分数与完整读法":"See scores and full guides"):(locale==="zh"?"下一题":"Next")}));}
}
describe("four complete CAT-Q readings with original keys and explicit non-diagnostic limits",()=>{
 it("keeps the strict original source and all paragraphs intact with idempotent projection",()=>{
  const before=JSON.stringify(quiz);expect(isCatQ25ConfigurationValid(quiz)).toBe(true);expect(isCatQ25ConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const[i,p]of readings.entries()){expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all eight full guides with collapsed contents, attribution and no personal numeric readouts",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");for(const locale of ["en","zh"]as const)for(const p of readings){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));const reader=d.querySelector(`[data-catq25-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(7);expect(reader.querySelectorAll("section li")).toHaveLength(17);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(7);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-catq25-sum],[data-catq25-mean],[data-catq25-result]")).toBeNull();expect(d.querySelector('[data-catq25-attribution] a[href="https://creativecommons.org/licenses/by/4.0/"]')).not.toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it("reaches all304 raw complete sums with source reversal and the actual25/9/8/8 denominators",()=>{
  let checked=0;const groups=[["overall",Array.from({length:25},(_,i)=>i+1)],["compensation",CATQ25_PART_KEYS.compensation],["masking",CATQ25_PART_KEYS.masking],["assimilation",CATQ25_PART_KEYS.assimilation]]as const;
  for(const[id,numbers]of groups)for(let sum=numbers.length;sum<=7*numbers.length;sum++){const a=fixed();let extra=sum-numbers.length;for(const n of numbers){const add=Math.min(extra,6),recoded=1+add;extra-=add;a[`CATQ_${String(n).padStart(2,"0")}`]=String(quiz.questions[n-1].reverse?8-recoded:recoded);}const r=scoreCatQ25(quiz,a);if(r.status!=="complete")throw Error(r.status);const value=id==="overall"?r.result.total:r.result.parts[id];expect(value).toEqual({numericCount:numbers.length,skippedCount:0,requiredCount:numbers.length,sum,mean:sum/numbers.length});checked++;}expect(checked).toBe(304);
 });
 it.each(["en","zh"]as const)("%s actual client retains all four full guides, partial withholding and all-skipped state without persistence",locale=>{
  const storage=vi.spyOn(Storage.prototype,"setItem");for(const mode of ["midpoint","skip-masking","all-skipped"]){const a=fixed(mode==="all-skipped"?"na":"4");if(mode==="skip-masking")a.CATQ_12="na";const{container}=render(<CatQ25Client quiz={quiz} locale={locale} readingProfiles={readings}/>);finish(container,locale,a);expect(container.querySelectorAll("[data-catq25-part]")).toHaveLength(4);expect(container.querySelectorAll("[data-catq25-result-reading]")).toHaveLength(4);for(const p of readings){const part=container.querySelector(`[data-catq25-part="${p.id}"]`)!;expect(part.querySelectorAll("h4")).toHaveLength(7);for(const s of p.sections)for(const para of s.paragraphs)expect(part.textContent).toContain(para[locale]);const unscored=mode==="all-skipped"||mode==="skip-masking"&&["overall","masking"].includes(p.id);expect(!!part.querySelector("[data-catq25-unscored]")).toBe(unscored);expect(!!part.querySelector("[data-catq25-sum]")).toBe(!unscored);if(!unscored)expect(part.querySelector("[data-catq25-mean]")?.textContent).toContain("4.00");}const ids=[...container.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of container.querySelectorAll('[data-catq25-result-reading] nav a'))expect(container.querySelector(a.getAttribute("href")!)).not.toBeNull();fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"清空并重新测试":"Clear and retake"}));expect(container.querySelector("[data-catq25-result-reading]")).toBeNull();cleanup();}expect(storage).not.toHaveBeenCalled();storage.mockRestore();
 });
 it("requires every ordered factor identity and correct provenance before replacing a source reading",()=>{
  const p=readings[0];for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["compensation"]}],[{...p,directionIds:[...p.directionIds].reverse()}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]as (QuestionnaireProfile[]|undefined)[]){const{container}=render(<CatQ25Client quiz={quiz} locale="en" readingProfiles={bad}/>);finish(container,"en");expect(container.querySelector("[data-catq25-result-reading]")).toBeNull();expect(container.querySelector('[data-catq25-part="overall"]')?.querySelectorAll("section li")).toHaveLength(14);cleanup();}
 });
});
