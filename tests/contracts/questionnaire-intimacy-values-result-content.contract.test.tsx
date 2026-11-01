import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/intimacy-values.json";
import content from "@/lib/questionnaires/result-content/intimacy-values.json";
import { intimacyValuesResultProfile } from "@/lib/questionnaires/result-content/intimacy-values";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreLikertQuestionnaire, isLikertConfigurationValid } from "@/lib/questionnaires/scoring";
import { IntimacyValuesReport } from "@/components/questionnaires/IntimacyValuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const patterns=[...["1","2","3","4","5","na"].map(v=>Array(25).fill(v)),Array.from({length:25},(_,i)=>["2","3","4","5","na"][Math.floor(i/5)]),Array.from({length:25},(_,i)=>["1","3","5","na","na"][Math.floor(i/5)])];
describe("Five full bilingual intimacy-values readings with independent means",()=>{
 it("preserves every source paragraph, identity and raw scoring input",()=>{
  const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isLikertConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=intimacyValuesResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);expect(r.title).toEqual(p.title);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);}
  for(const values of patterns){const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]]));expect(scoreLikertQuestionnaire(prepared,a)).toEqual(scoreLikertQuestionnaire(quiz,a));}const unknown={...quiz.profiles[0],id:"__proto__"};expect(intimacyValuesResultProfile(unknown)).toBe(unknown);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens every full %s public reading without personal means",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-intimacy-values-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-intimacy-values-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-intimacy-values-mean]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains all40full %s modules for every anchor, allNA and both sides of minimum4",locale=>{
  const prepared=prepareQuestionnaireResultReadings(quiz);
  for(const values of patterns){const result=scoreLikertQuestionnaire(prepared,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]])));if(result.status!=="complete")throw Error('Complete record required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<IntimacyValuesReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll('[data-intimacy-values-result-reading]')).toHaveLength(5);expect(root.querySelectorAll('[data-intimacy-values-part] h4')).toHaveLength(40);for(const p of quiz.profiles){const reading=root.querySelector(`[data-intimacy-values-result-reading="${p.id}"]`)!;for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(reading.textContent).toContain(t[locale]);const f=result.facets[p.id],facet=root.querySelector(`[data-intimacy-values-part="${p.id}"]`)!;expect(facet.querySelector('[data-intimacy-values-mean]')?.textContent).toContain(f.rated>=4?`${f.mean!.toFixed(1)} / 5`:locale==='zh'?'资料不足':'Insufficient information');expect(facet.querySelector('[role="meter"]')).toBeNull();}}
 });
});
