import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/relationship-worry-habits.json";
import content from "@/lib/questionnaires/result-content/relationship-worry-habits.json";
import { relationshipWorryResultProfile } from "@/lib/questionnaires/result-content/relationship-worry-habits";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreLikertQuestionnaire, isLikertConfigurationValid } from "@/lib/questionnaires/scoring";
import { RelationshipWorryHabitsReport } from "@/components/questionnaires/RelationshipWorryHabitsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const patterns=[...["1","2","3","4","5","na"].map(v=>Array(16).fill(v)),Array.from({length:16},(_,i)=>["1","3","5","na"][Math.floor(i/4)]),Array.from({length:16},(_,i)=>["1","5","na","na"][Math.floor(i/4)])];
describe("Four full bilingual relationship-worry-habits readings with independent means",()=>{
 it("preserves every source paragraph, identity and raw scoring input",()=>{
  const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isLikertConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=relationshipWorryResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);expect(r.title).toEqual(p.title);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);}
  for(const values of patterns){const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]]));expect(scoreLikertQuestionnaire(prepared,a)).toEqual(scoreLikertQuestionnaire(quiz,a));}const unknown={...quiz.profiles[0],id:"__proto__"};expect(relationshipWorryResultProfile(unknown)).toBe(unknown);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens every full %s public reading without personal means",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-relationship-worry-habits-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-relationship-worry-habits-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-relationship-worry-habits-mean]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains all32full %s modules for every anchor, allNA and both sides of minimum3",locale=>{
  const prepared=prepareQuestionnaireResultReadings(quiz);
  for(const values of patterns){const result=scoreLikertQuestionnaire(prepared,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]])));if(result.status!=="complete")throw Error('Complete record required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<RelationshipWorryHabitsReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll('[data-relationship-worry-habits-result-reading]')).toHaveLength(4);expect(root.querySelectorAll('[data-relationship-worry-habits-part] h4')).toHaveLength(32);for(const p of quiz.profiles){const reading=root.querySelector(`[data-relationship-worry-habits-result-reading="${p.id}"]`)!;for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(reading.textContent).toContain(t[locale]);const f=result.facets[p.id],facet=root.querySelector(`[data-relationship-worry-habits-part="${p.id}"]`)!;expect(facet.querySelector('[data-relationship-worry-habits-mean]')?.textContent).toContain(f.rated>=3?`${f.mean!.toFixed(1)} / 5`:locale==='zh'?'资料不足':'Insufficient information');expect(Boolean(facet.querySelector('[role="meter"]'))).toBe(f.rated>=3);}}
 });
});
