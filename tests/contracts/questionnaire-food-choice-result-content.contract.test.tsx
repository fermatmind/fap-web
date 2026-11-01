import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/food-choice.json";
import content from "@/lib/questionnaires/result-content/food-choice.json";
import { foodChoiceResultProfile } from "@/lib/questionnaires/result-content/food-choice";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreDirectionalQuestionnaire, isDirectionalConfigurationValid } from "@/lib/questionnaires/scoring";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
const answers=(mask:number)=>Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options[(mask>>i)&1].id]));
describe("Seven original food presentation readings retaining all highest ties",()=>{
 it("preserves identities, all original bodies and every one of4096 selection outcomes",()=>{
  const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isDirectionalConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=foodChoiceResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
  for(let mask=0;mask<4096;mask++)expect(scoreDirectionalQuestionnaire(prepared,answers(mask))).toEqual(scoreDirectionalQuestionnaire(quiz,answers(mask)));
  const unknown={...quiz.profiles[0],id:"__proto__"};expect(foodChoiceResultProfile(unknown)).toBe(unknown);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens all seven complete %s public guides without private attempts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-food-choice-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-food-choice-result-reading] h2')).toHaveLength(7);expect(dom.querySelector('[data-food-choice-answer]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains the full %s selected guide for every61 distinct count vector",locale=>{
  const seen=new Set<string>(),profiles=new Set<string>();for(let mask=0;mask<4096;mask++){const result=scoreDirectionalQuestionnaire(prepared,answers(mask));if(result.status!=="complete")throw Error("Complete result required");const key=JSON.stringify(result.counts);if(seen.has(key))continue;seen.add(key);profiles.add(result.profileId);const profile=prepared.profiles.find(p=>p.id===result.profileId)!;expect([...profile.directionIds].sort()).toEqual([...result.leaders].sort());const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale}/>);expect(dom.querySelectorAll('[data-food-choice-result-reading] h3')).toHaveLength(7);for(const s of content[profile.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);expect(Object.values(result.counts).reduce((a,b)=>a+b,0)).toBe(12);expect(Object.keys(result).sort()).toEqual(["answered","counts","leaders","profileId","status"]);}
  expect(seen.size).toBe(61);expect([...profiles].sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
 });
});
