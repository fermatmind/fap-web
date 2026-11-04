import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QuestionnaireFds32Report } from "@/components/questionnaires/QuestionnaireFds32Report";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/food-disgust.json","utf8")) as Questionnaire;
const readings=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"3"]));
function complete(answers:Record<string,string>){const r=scoreQuestionnaire(quiz,answers);if(r.status!=="complete"||!("facets" in r))throw Error(r.status);return r;}
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};
describe("FDS32 unequal-length raw readouts and eight expanded full guides",()=>{
 it("keeps the strict published bank immutable with idempotent projection and all original paragraphs",()=>{
  const before=JSON.stringify(quiz);expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);expect(isQuestionnaireConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const [i,p]of readings.entries()){expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(19);expect([p.id,p.title,p.directionIds,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].title,quiz.profiles[i].directionIds,quiz.profiles[i].seo]);for(const[j,s]of p.sections.entries())expect(s.paragraphs.slice(0,2)).toEqual(quiz.profiles[i].sections[j].paragraphs);}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("publishes all sixteen guides with collapsed navigation, full text and source licensing without private values",async()=>{
  const{default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");for(const locale of ["en","zh"]as const)for(const p of readings){const d=dom(renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));const reader=d.querySelector(`[data-food-disgust-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(8);expect(reader.querySelectorAll("section > div > p:not(:only-child)")).toHaveLength(19);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(8);for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-fds-mean],[data-fds-answer]")).toBeNull();expect(d.querySelector('[data-fds-attribution] a[href="https://creativecommons.org/licenses/by/4.0/"]')).not.toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it("renders every reachable complete sum using the actual three, four or five item denominator",()=>{
  let checked=0,offset=0;for(const part of quiz.directions){const n=part.itemCount!;for(let sum=n;sum<=6*n;sum++){const a=base();let extra=sum-n;for(let j=0;j<n;j++){const add=Math.min(extra,5);a[quiz.questions[offset+j].id]=String(1+add);extra-=add;}const r=complete(a),d=dom(renderToStaticMarkup(<QuestionnaireFds32Report quiz={quiz} result={r} answers={a} readingProfiles={readings} locale="en"/>));expect(d.querySelector(`[data-fds-sum="${part.id}"]`)?.textContent).toBe(String(sum));expect(d.querySelector(`[data-fds-count="${part.id}"]`)?.textContent).toBe(`${n} / ${n}`);expect(d.querySelector(`[data-fds-mean="${part.id}"]`)?.textContent).toBe(`${(Math.floor((sum*20+n)/(2*n))/10).toFixed(1)} / 6`);expect(d.querySelectorAll("[data-food-disgust-result-reading]")).toHaveLength(8);checked++;}offset+=n;}expect(checked).toBe(168);
 },30000);
 it("withholds a part mean at every partial count while retaining numeric sums, all guides and answer rows",()=>{
  for(const locale of ["en","zh"]as const){let offset=0;for(const part of quiz.directions){const n=part.itemCount!;for(let rated=0;rated<n;rated++){const a=base();for(let j=0;j<n;j++)a[quiz.questions[offset+j].id]=j<rated?"6":"na";const d=dom(renderToStaticMarkup(<QuestionnaireFds32Report quiz={quiz} result={complete(a)} answers={a} readingProfiles={readings} locale={locale}/>));expect(d.querySelector(`[data-fds-sum="${part.id}"]`)?.textContent).toBe(rated?String(6*rated):"—");expect(d.querySelector(`[data-fds-count="${part.id}"]`)?.textContent).toBe(`${rated} / ${n}`);expect(d.querySelector(`[data-fds-mean="${part.id}"]`)?.textContent).toBe(locale==="zh"?"不计算":"Not calculated");expect(d.querySelectorAll("[data-food-disgust-result-reading]")).toHaveLength(8);expect(d.querySelectorAll("[data-fds-answer]")).toHaveLength(32);}offset+=n;}
   const a=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])),d=dom(renderToStaticMarkup(<QuestionnaireFds32Report quiz={quiz} result={complete(a)} answers={a} readingProfiles={readings} locale={locale}/>));expect(d.querySelectorAll("[data-food-disgust-result-reading]")).toHaveLength(8);expect([...d.querySelectorAll("[data-fds-mean]")].every(n=>n.textContent===(locale==="zh"?"不计算":"Not calculated"))).toBe(true);const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of d.querySelectorAll("[data-food-disgust-result-reading] nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();}
 });
 it("rejects mismatched projected identity, direction and provenance while preserving the original full fallback",()=>{
  const p=readings[0],a=base();for(const bad of [undefined,[{...p,id:"other"}],[{...p,directionIds:["other"]}],[{...p,resultReading:{...p.resultReading!,quizSlug:"other"}}],[{...p,resultReading:{...p.resultReading!,profileId:"other"}}]]){const d=dom(renderToStaticMarkup(<QuestionnaireFds32Report quiz={quiz} result={complete(a)} answers={a} readingProfiles={bad} locale="en"/>));expect(d.querySelector("[data-food-disgust-result-reading]")).toBeNull();expect(d.querySelectorAll('[data-fds-full="animal-flesh"] section > div > p:not(:only-child)')).toHaveLength(16);expect(d.querySelectorAll("[data-fds-full]")).toHaveLength(8);}
 });
});
