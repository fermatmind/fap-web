import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/sake-type.json";
import states from "@/tests/fixtures/questionnaires/sake-type-counts-reference.json";
import content from "@/lib/questionnaires/result-content/sake-type.json";
import { sakeResultProfile } from "@/lib/questionnaires/result-content/sake-type";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
const witness=(counts:number[])=>{const directions=counts.flatMap((n,i)=>Array(n).fill(quiz.directions[i].id));return Object.fromEntries(quiz.questions.map((q,i)=>[q.id,q.options.find(o=>o.directionId===directions[i])!.id]));};
describe("Four full sake metaphors with bilingual scenes and every highest tie",()=>{
 it("preserves identity and Chinese scenes, aligns four English scenes and adds exactly three paragraphs",()=>{
  const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));const required={"sparkling-wine":["community book swap","optional","how to join"],beer:["community puzzle swap","simply browse","no items"],whisky:["community exhibition","old door number","neighbourhood change","exhibition route"],sake:["community message corner","One card","need not write"]};
  for(const p of quiz.profiles){const r=sakeResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const section of p.sections){const text=r.sections.find(s=>s.id===section.id)!.paragraphs[0];if(section.id==='scene'){expect(text.zh).toBe(section.paragraphs[0].zh);for(const word of required[p.id as keyof typeof required])expect(text.en).toContain(word);expect(text.en).not.toBe(section.paragraphs[0].en);}else expect(text).toEqual(section.paragraphs[0]);}}
  expect(JSON.stringify(quiz)).toBe(before);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);expect(isArchetypeConfigurationValid(prepared)).toBe(true);const unknown={...quiz.profiles[0],id:'__proto__'};expect(sakeResultProfile(unknown)).toBe(unknown);for(const s of states.states)expect(scoreArchetypeQuestionnaire(prepared,witness(s.counts))).toEqual(scoreArchetypeQuestionnaire(quiz,witness(s.counts)));
 });
 it.each(["zh","en"]as const)("opens all four public %s readings with corrections and no private counts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-sake-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-sake-result-reading] h2')).toHaveLength(6);expect(dom.querySelector('[data-archetype-count]')).toBeNull();for(const section of sakeResultProfile(p).sections)for(const t of section.paragraphs)expect(dom.querySelector(`#report-${section.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==='en')expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"]as const)("keeps all fifteen highest subsets and their complete %s readings",locale=>{
  const first=new Map<string,number[]>();for(const s of states.states)if(!first.has(s.highestIndices.join('|')))first.set(s.highestIndices.join('|'),s.counts);expect(first.size).toBe(15);for(const counts of first.values()){const result=scoreArchetypeQuestionnaire(prepared,witness(counts));if(result.status!=='complete')throw Error('Complete result required');const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepared} result={result} locale={locale}/>);expect(dom.querySelectorAll('[data-archetype-match]')).toHaveLength(result.profileIds.length);expect(Object.values(result.counts)).toEqual(counts);for(const id of result.profileIds){const block=dom.querySelector(`[data-archetype-match="${id}"]`)!;expect(block.querySelectorAll('h4')).toHaveLength(6);for(const s of sakeResultProfile(quiz.profiles.find(p=>p.id===id)!).sections)for(const t of s.paragraphs)expect(block.textContent).toContain(t[locale]);}expect(Object.keys(result).sort()).toEqual(['answered','counts','profileIds','status']);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);}
 });
});
