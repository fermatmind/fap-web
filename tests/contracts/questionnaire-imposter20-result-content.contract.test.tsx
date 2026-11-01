import { readFileSync } from "node:fs";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Imposter20Client } from "@/components/questionnaires/Imposter20Client";
import { isImposter20ConfigurationValid, scoreImposter20, IMPOSTER20_TOPICS, type Imposter20Questionnaire } from "@/lib/questionnaires/imposter20";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/imposter-syndrome.json","utf8")) as Imposter20Questionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
beforeEach(()=>Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()}));
afterEach(cleanup);
const fixed=(v="2")=>Object.fromEntries(quiz.questions.map(q=>[q.id,v]));
function finish(container:HTMLElement,locale:"en"|"zh",answers:Record<string,string>=fixed()){
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始测试":"Start test"}));
 for(const[i,q]of quiz.questions.entries()){fireEvent.click(container.querySelector(`input[value="${answers[q.id]}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===19?(locale==="zh"?"查看五组读数与完整读法":"See five readings and full guides"):(locale==="zh"?"下一题":"Next")}));}
}
describe("five original achievement self-doubt readings without a total or borrowed CIPS bands",()=>{
 it("keeps the strict original source and all paragraphs intact with idempotent projection",()=>{
  const before=JSON.stringify(quiz);expect(isImposter20ConfigurationValid(quiz)).toBe(true);expect(isImposter20ConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const[i,p]of readings.entries()){expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all ten full guides with collapsed contents, attribution and no personal numeric readouts",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");for(const locale of ["en","zh"]as const)for(const p of readings){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));const reader=d.querySelector(`[data-imposter20-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(7);expect(reader.querySelectorAll("section li")).toHaveLength(17);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(7);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-imposter20-sum],[data-imposter20-mean],[data-imposter20-result]")).toBeNull();expect(d.querySelector('[data-imposter20-attribution] a[href="https://pmc.ncbi.nlm.nih.gov/articles/PMC13129615/"]')).not.toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it("preserves all225 marginal count/sum witnesses and the editorial minimum-three policy",()=>{
  let checked=0;for(const[group,id]of IMPOSTER20_TOPICS.entries())for(let numeric=0;numeric<=4;numeric++)for(let sum=0;sum<=numeric*4;sum++){const a=fixed();let remainder=sum;for(let j=0;j<4;j++){const v=j<numeric?Math.min(remainder,4):null;if(v!==null)remainder-=v;a[`IPR_${String(group*4+j+1).padStart(2,"0")}`]=v===null?"na":String(v);}const r=scoreImposter20(quiz,a);if(r.status!=="complete")throw Error(r.status);expect(r.result[id]).toEqual({numericCount:numeric,skippedCount:4-numeric,requiredCount:4,sum:numeric>=3?sum:null,mean:numeric>=3?sum/numeric:null});expect(Object.keys(r.result)).toEqual(IMPOSTER20_TOPICS);checked++;}expect(checked).toBe(225);
 });
 it.each(["en","zh"]as const)("%s actual client retains all five guides, explicit zero and minimum coverage without persistence",locale=>{
  const storage=vi.spyOn(Storage.prototype,"setItem");for(const mode of ["midpoint","three-zero","two-numeric","all-skipped"]){const a=fixed(mode==="all-skipped"?"na":"2");if(mode==="three-zero"||mode==="two-numeric")for(let j=0;j<4;j++)a[`IPR_${String(j+1).padStart(2,"0")}`]=j<(mode==="three-zero"?3:2)?"0":"na";const{container}=render(<Imposter20Client quiz={quiz} locale={locale} readingProfiles={readings}/>);finish(container,locale,a);expect(container.querySelectorAll("[data-imposter20-part]")).toHaveLength(5);expect(container.querySelectorAll("[data-imposter20-result-reading]")).toHaveLength(5);for(const p of readings){const part=container.querySelector(`[data-imposter20-part="${p.id}"]`)!;expect(part.querySelectorAll("h4")).toHaveLength(7);for(const s of p.sections)for(const para of s.paragraphs)expect(part.textContent).toContain(para[locale]);const unscored=mode==="all-skipped"||mode==="two-numeric"&&p.id==="contribution";expect(!!part.querySelector("[data-imposter20-unscored]")).toBe(unscored);expect(!!part.querySelector("[data-imposter20-sum]")).toBe(!unscored);if(!unscored)expect(part.querySelector("[data-imposter20-mean]")?.textContent).toContain(mode==="three-zero"&&p.id==="contribution"?"0.00":"2.00");}expect(container.querySelector('[data-imposter20-part="overall"]')).toBeNull();const ids=[...container.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of container.querySelectorAll('[data-imposter20-result-reading] nav a'))expect(container.querySelector(a.getAttribute("href")!)).not.toBeNull();fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"清空并重新测试":"Clear and retake"}));expect(container.querySelector("[data-imposter20-result-reading]")).toBeNull();cleanup();}expect(storage).not.toHaveBeenCalled();storage.mockRestore();
 });
 it("requires every single factor identity and correct provenance before replacing a source reading",()=>{
  const p=readings[0];for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:[]}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]as (QuestionnaireProfile[]|undefined)[]){const{container}=render(<Imposter20Client quiz={quiz} locale="en" readingProfiles={bad}/>);finish(container,"en");expect(container.querySelector("[data-imposter20-result-reading]")).toBeNull();expect(container.querySelector('[data-imposter20-part="contribution"]')?.querySelectorAll("section li")).toHaveLength(14);cleanup();}
 });
});
