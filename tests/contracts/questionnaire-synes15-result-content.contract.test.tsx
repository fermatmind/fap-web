import { readFileSync } from "node:fs";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Synes15Client } from "@/components/questionnaires/Synes15Client";
import { isSynes15ConfigurationValid, scoreSynes15, SYNES15_TOPICS, type Synes15Questionnaire } from "@/lib/questionnaires/synes15";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/synesthesia-test.json","utf8")) as Synes15Questionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
beforeEach(()=>Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()}));
afterEach(cleanup);
const fixed=(v="yes")=>Object.fromEntries(quiz.questions.map(q=>[q.id,v]));
function finish(container:HTMLElement,locale:"en"|"zh",answers:Record<string,string>=fixed()){
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始测试":"Start test"}));
 for(const[i,q]of quiz.questions.entries()){fireEvent.click(container.querySelector(`input[value="${answers[q.id]}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===14?(locale==="zh"?"查看五组记录与完整读法":"See five records and full guides"):(locale==="zh"?"下一题":"Next")}));}
}
describe("five literal synesthetic experience readings without a score or classification",()=>{
 it("keeps the strict original source and all paragraphs intact with idempotent projection",()=>{
  const before=JSON.stringify(quiz);expect(isSynes15ConfigurationValid(quiz)).toBe(true);expect(isSynes15ConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const[i,p]of readings.entries()){expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all ten full guides with collapsed contents, attribution and no personal numeric readouts",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");for(const locale of ["en","zh"]as const)for(const p of readings){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));const reader=d.querySelector(`[data-synes15-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(7);expect(reader.querySelectorAll("section li")).toHaveLength(17);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(7);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-synes15-count],[data-synes15-result]")).toBeNull();expect(d.querySelector('[data-synes15-attribution] a[href="https://www.sussex.ac.uk/synaesthesia/faq"]')).not.toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["en","zh"]as const)("%s actual client retains all five full guides and every literal choice without persistence",locale=>{
  const storage=vi.spyOn(Storage.prototype,"setItem");for(const mode of ["yes","no","unsure","na","mixed"]){const a=fixed(mode==="mixed"?"no":mode);if(mode==="mixed")for(let i=0;i<15;i++)a[quiz.questions[i].id]=["yes","no","unsure","na"][i%4];const{container}=render(<Synes15Client quiz={quiz} locale={locale} readingProfiles={readings}/>);finish(container,locale,a);expect(container.querySelectorAll("[data-synes15-part]")).toHaveLength(5);expect(container.querySelectorAll("[data-synes15-result-reading]")).toHaveLength(5);const checked=scoreSynes15(quiz,a);if(checked.status!=="complete")throw Error(checked.status);for(const p of readings){const part=container.querySelector(`[data-synes15-part="${p.id}"]`)!;expect(part.querySelectorAll("h4")).toHaveLength(7);for(const s of p.sections)for(const para of s.paragraphs)expect(part.textContent).toContain(para[locale]);const result=checked.result[p.id as typeof SYNES15_TOPICS[number]];const c=result.counts;expect(part.querySelector("[data-synes15-count]")?.textContent).toBe(locale==="zh"?`三条中的回答计数：有 ${c.yes}；没有 ${c.no}；不确定 ${c.unsure}；无机会／不愿回答 ${c.na}。`:`Response counts out of three: yes ${c.yes}; no ${c.no}; unsure ${c.unsure}; no opportunity / decline ${c.na}.`);const items=part.querySelectorAll("[data-synes15-responses] li");expect(items).toHaveLength(3);for(const[i,response]of result.responses.entries()){const item=quiz.questions.find(q=>q.id===response.questionId)!;expect(items[i].textContent).toBe(item.prompt[locale]+item.options.find(o=>o.id===response.choice)!.label[locale]);}expect(part.querySelector("[data-synes15-sum],[data-synes15-mean]")).toBeNull();}const ids=[...container.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of container.querySelectorAll('[data-synes15-result-reading] nav a'))expect(container.querySelector(a.getAttribute("href")!)).not.toBeNull();fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"清空并重新测试":"Clear and retake"}));expect(container.querySelector("[data-synes15-result-reading]")).toBeNull();cleanup();}expect(storage).not.toHaveBeenCalled();storage.mockRestore();
 });
 it("requires every single factor identity and correct provenance before replacing a source reading",()=>{
  const p=readings[0];for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:[]}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]as (QuestionnaireProfile[]|undefined)[]){const{container}=render(<Synes15Client quiz={quiz} locale="en" readingProfiles={bad}/>);finish(container,"en");expect(container.querySelector("[data-synes15-result-reading]")).toBeNull();expect(container.querySelector('[data-synes15-part="symbol-color"]')?.querySelectorAll("article section li")).toHaveLength(14);cleanup();}
 });
});
