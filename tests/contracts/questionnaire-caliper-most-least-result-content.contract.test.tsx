import { readFileSync } from "node:fs";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MostLeastClient } from "@/components/questionnaires/MostLeastClient";
import { isMostLeastConfigurationValid, scoreMostLeast, MOST_LEAST_TOPICS, type MostLeastAnswers } from "@/lib/questionnaires/mostLeast";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/caliper-style-assessment-test.json","utf8")) as Questionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
afterEach(cleanup);
const fixed=():MostLeastAnswers=>Object.fromEntries(quiz.questions.map(q=>[q.id,{most:"A",least:"B"}]));
function finish(container:HTMLElement,locale:"en"|"zh",answers:MostLeastAnswers=fixed()){
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始练习":"Start practice"}));
 for(const[i,q]of quiz.questions.entries()){for(const side of ["most","least"]as const)fireEvent.click(container.querySelector(`input[name="${q.id}-${side}"][value="${answers[q.id][side]}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===15?(locale==="zh"?"查看完整记录":"See complete record"):(locale==="zh"?"下一组":"Next")}));}
}
describe("eight most/least result readings without changing the strict original practice",()=>{
 it("preserves raw identities, paragraphs and validation with idempotent guarded projection",()=>{
  const before=JSON.stringify(quiz);expect(isMostLeastConfigurationValid(quiz)).toBe(true);expect(isMostLeastConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const[i,p]of readings.entries()){expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all sixteen guides with seven collapsed contents links and no personal counts",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");for(const locale of ["en","zh"]as const)for(const p of readings){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));const reader=d.querySelector(`[data-most-least-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(7);expect(reader.querySelectorAll("section > div > p:not(:only-child)")).toHaveLength(17);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(7);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-most-least-topic],[data-count]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it("reaches all360 possible marginal count pairs without treating unselected appearances as missing",()=>{
  let checked=0;for(const topic of MOST_LEAST_TOPICS)for(let most=0;most<=8;most++)for(let least=0;least<=8-most;least++){let appearance=0;const a=fixed();for(const q of quiz.questions){const target=q.options.find(o=>o.directionId===topic);if(!target)continue;const others=q.options.filter(o=>o!==target);a[q.id]=appearance<most?{most:target.id,least:others[0].id}:appearance<most+least?{most:others[0].id,least:target.id}:{most:others[0].id,least:others[1].id};appearance++;}const result=scoreMostLeast(quiz,a);if(result.status!=="complete")throw Error(result.status);expect(result.counts[topic]).toEqual({most,least,difference:most-least});expect(Object.values(result.counts).reduce((s,c)=>s+c.most,0)).toBe(16);expect(Object.values(result.counts).reduce((s,c)=>s+c.least,0)).toBe(16);expect(Object.values(result.counts).reduce((s,c)=>s+c.difference,0)).toBe(0);checked++;}expect(checked).toBe(360);
 });
 it.each(["en","zh"]as const)("%s actual native client keeps both zero-difference counts and all expanded full guides without persistence",locale=>{
  const storage=vi.spyOn(Storage.prototype,"setItem");const{container}=render(<MostLeastClient quiz={quiz} locale={locale} readingProfiles={readings}/>);finish(container,locale);expect(container.querySelectorAll("[data-most-least-topic]")).toHaveLength(8);expect(container.querySelectorAll("[data-most-least-result-reading]")).toHaveLength(8);for(const p of readings){const part=container.querySelector(`[data-most-least-topic="${p.id}"]`)!;expect(part.querySelector('[data-count="most"]')?.textContent).toBe("2 / 8");expect(part.querySelector('[data-count="least"]')?.textContent).toBe("2 / 8");expect(part.querySelector('[data-count="difference"]')?.textContent).toBe("0");expect(part.querySelectorAll("h4")).toHaveLength(7);for(const s of p.sections)for(const para of s.paragraphs)expect(part.textContent).toContain(para[locale]);}const ids=[...container.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of container.querySelectorAll('[data-most-least-result-reading] nav a'))expect(container.querySelector(a.getAttribute("href")!)).not.toBeNull();expect(storage).not.toHaveBeenCalled();fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"重新练习":"Retake practice"}));expect(container.querySelector("[data-most-least-result-reading]")).toBeNull();expect(container.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0);storage.mockRestore();
 });
 it("falls back to original full reading on mismatched identity, direction or reading provenance",()=>{
  const p=readings[0];for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]as (QuestionnaireProfile[]|undefined)[]){const{container}=render(<MostLeastClient quiz={quiz} locale="en" readingProfiles={bad}/>);finish(container,"en");expect(container.querySelector("[data-most-least-result-reading]")).toBeNull();expect(container.querySelector('[data-most-least-topic="context"]')?.querySelectorAll("section > div > p:not(:only-child)")).toHaveLength(14);cleanup();}
 });
});
