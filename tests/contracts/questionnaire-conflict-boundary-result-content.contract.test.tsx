import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QuestionnaireConflictClient } from "@/components/questionnaires/QuestionnaireConflictClient";
import { QuestionnaireConflictReport } from "@/components/questionnaires/QuestionnaireConflictReport";
import { isMiniConflictConfigurationValid, scoreMiniConflictQuestionnaire, type MiniConflictQuestionnaire } from "@/lib/questionnaires/miniConflict";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { correctConflictReadingPrivacy } from "@/lib/questionnaires/result-content/conflict-boundary-privacy";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/conflict-boundary-behaviors-test.json","utf8")) as MiniConflictQuestionnaire;
const witnesses=JSON.parse(readFileSync("tests/fixtures/questionnaires/conflict-boundary-numeric-reference.json","utf8")).rows as {witness:string[];rated:number;sum:number;mean:number|null}[];
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
function complete(answers:Record<string,string>){const r=scoreMiniConflictQuestionnaire(quiz,answers);if(r.status!=="complete")throw Error(r.status);return r;}
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};

describe("four behavior readings with unchanged skip thresholds and current privacy facts",()=>{
 it("keeps raw strict source immutable and all original prose except three outdated published privacy sentences",()=>{
  const before=JSON.stringify(quiz);expect(isMiniConflictConfigurationValid(quiz)).toBe(true);expect(isMiniConflictConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const [i,p]of readings.entries()){
   expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(19);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);
   const current=correctConflictReadingPrivacy(quiz.profiles[i]);expect(correctConflictReadingPrivacy(current)).toBe(current);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(current.sections[j].paragraphs);
   for(let j=0;j<7;j++)expect(current.sections[j]).toEqual(quiz.profiles[i].sections[j]);
   if(i!==2){expect(current.sections[7].paragraphs[1].en).toContain("separately opted-in anonymous answering-page counts contain no answers or result content");expect(current.sections[7].paragraphs[1].zh).toContain("答题页另有自愿开启的匿名动作统计");}
  }
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"unknown"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);expect(correctConflictReadingPrivacy(unknown)).toBe(unknown);
 });
 it("publishes all eight real public guides, complete additions and collapsed anchors without a personal record",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const locale of ["en","zh"]as const)for(const p of readings){const d=dom(renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));const reader=d.querySelector(`[data-conflict-boundary-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(8);expect(reader.querySelectorAll("section > div > p:not(:only-child)")).toHaveLength(19);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(8);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-conflict-mean],[data-conflict-sum]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each([0,1,2,3])("retains all 91 marginal count/sum witnesses for group %i and withholds insufficient readings",group=>{
  let checked=0;for(const row of witnesses){const a=base();row.witness.forEach((v,i)=>{a[quiz.questions[group*6+i].id]=v;});const r=complete(a),d=dom(renderToStaticMarkup(<QuestionnaireConflictReport quiz={quiz} result={r} readingProfiles={readings} locale="en"/>));const part=d.querySelector(`[data-conflict-part="${quiz.directions[group].id}"]`)!;expect(part.querySelector("[data-conflict-count]")?.textContent).toBe(`${row.rated} of 6 numeric responses; ${6-row.rated} skipped.`);if(row.mean===null){expect(part.querySelector("[data-conflict-mean],[data-conflict-sum],[data-conflict-boundary-result-reading]")).toBeNull();expect(part.querySelector("[data-conflict-insufficient]")).not.toBeNull();}else{expect(part.querySelector("[data-conflict-mean]")?.textContent).toBe(`Mean: ${row.mean.toFixed(4)} / 5 (${row.sum} ÷ ${row.rated}, rounded to four decimals)`);expect(part.querySelectorAll("[data-conflict-boundary-result-reading]")).toHaveLength(1);}expect(d.querySelectorAll("[data-conflict-boundary-result-reading]")).toHaveLength(row.mean===null?3:4);checked++;}expect(checked).toBe(91);
 });
 it("withholds exactly the insufficient readings for all 16 masks in both languages",()=>{
  for(const locale of ["en","zh"]as const)for(let mask=0;mask<16;mask++){const a=base();for(let g=0;g<4;g++)if(mask&(1<<g))for(let j=0;j<3;j++)a[quiz.questions[g*6+j].id]="na";const d=dom(renderToStaticMarkup(<QuestionnaireConflictReport quiz={quiz} result={complete(a)} readingProfiles={readings} locale={locale}/>));expect(d.querySelectorAll("[data-conflict-boundary-result-reading]")).toHaveLength(4-mask.toString(2).replaceAll("0","").length);if(mask===15){expect(d.querySelector("[data-conflict-all-insufficient]")).not.toBeNull();expect(d.querySelector("[data-conflict-part],[data-conflict-mean],[data-conflict-sum]")).toBeNull();}const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);}
 });
 it("falls back to original reading depth with corrected privacy for a mismatched product, direction or profile",()=>{
  const p=readings[0],result=complete(base());for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]){const d=dom(renderToStaticMarkup(<QuestionnaireConflictReport quiz={quiz} result={result} readingProfiles={bad} locale="en"/>));expect(d.querySelector("[data-conflict-boundary-result-reading]")).toBeNull();expect(d.querySelectorAll('[data-conflict-part="CONFLICT_ESCALATION"] section > div > p:not(:only-child)')).toHaveLength(16);expect(d.textContent).toContain("separately opted-in anonymous answering-page counts");expect(d.textContent).not.toContain("without analytics or personal-result sharing");}
 });
 it("runs strict native mixed and all-skipped attempts without personal sharing or persistence",async()=>{
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});const writeText=vi.fn();Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");const{container}=render(<QuestionnaireConflictClient quiz={quiz} readingProfiles={readings} locale="en"/>);
  fireEvent.click(screen.getByRole("button",{name:"Start test"}));for(let i=0;i<24;i++){fireEvent.click(container.querySelector(`input[value="${i<3?"na":"3"}"]`)!);fireEvent.click(screen.getByRole("button",{name:i===23?"See this record":"Next"}));}expect(container.querySelectorAll("[data-conflict-boundary-result-reading]")).toHaveLength(3);expect(screen.queryByRole("button",{name:/copy|share/i})).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Answer again if you want (empty answers)"}));expect(container.querySelector("input:checked")).toBeNull();for(let i=0;i<24;i++){fireEvent.click(container.querySelector('input[value="na"]')!);fireEvent.click(screen.getByRole("button",{name:i===23?"See this record":"Next"}));}expect(container.querySelector("[data-conflict-all-insufficient]")).not.toBeNull();expect(container.querySelector("[data-conflict-boundary-result-reading],[data-conflict-mean],[data-conflict-sum]")).toBeNull();await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Exit and clear these responses"})));expect(screen.getByRole("button",{name:"Start test"})).toBeVisible();expect(writeText).not.toHaveBeenCalled();expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
 });
});
