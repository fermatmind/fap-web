import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/values-assessment.json";
import content from "@/lib/questionnaires/result-content/values-assessment.json";
import { workValuesResultProfile } from "@/lib/questionnaires/result-content/values-assessment";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreArchetypeQuestionnaire, isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import { QuestionnaireWorkValuesReport } from "@/components/questionnaires/QuestionnaireWorkValuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
const answers=(mask:number)=>{let seed=mask+1;return Object.fromEntries(quiz.questions.map(q=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return[q.id,q.options[(seed>>>0)%4].id];}));};
describe("Ten original work priorities with equal shared ranks",()=>{
 it("preserves identities, all original bodies and a bounded4096 sample of selection outcomes",()=>{
  const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isArchetypeConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=workValuesResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
  for(let mask=0;mask<4096;mask++)expect(scoreArchetypeQuestionnaire(prepared,answers(mask))).toEqual(scoreArchetypeQuestionnaire(quiz,answers(mask)));
  const unknown={...quiz.profiles[0],id:"__proto__"};expect(workValuesResultProfile(unknown)).toBe(unknown);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens all ten complete %s public guides without private attempts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-work-values-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-work-values-result-reading] h2')).toHaveLength(7);expect(dom.querySelector('[data-work-value]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains complete %s guides and actual ranks for singles, all-ten ties and edits",locale=>{
  const patterns=quiz.directions.map(d=>Object.fromEntries(quiz.questions.map(q=>[q.id,(q.options.find(o=>o.directionId===d.id)??q.options[0]).id])));
  for(let position=0;position<4;position++){const a=Object.fromEntries(quiz.questions.map(q=>[q.id,q.options[position].id]));patterns.push(a);patterns.push({...a,[quiz.questions[0].id]:quiz.questions[0].options[(position+1)%4].id});}
  const reached=new Set<string>();for(const a of patterns){const result=scoreArchetypeQuestionnaire(prepared,a);if(result.status!=="complete")throw Error("Complete result required");expect(result).toEqual(scoreArchetypeQuestionnaire(quiz,a));const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireWorkValuesReport quiz={prepared} result={result} answers={a} locale={locale}/>);expect(dom.querySelectorAll('[data-work-value]')).toHaveLength(10);expect(dom.querySelectorAll('[data-work-values-result-reading]')).toHaveLength(result.profileIds.length);for(const d of quiz.directions){const row=dom.querySelector(`[data-work-value="${d.id}"]`)!;expect(row.querySelectorAll('td')[0]?.textContent).toBe(`${result.counts[d.id]} / 12`);expect(row.querySelectorAll('td')[1]?.textContent).toBe(String(1+Object.values(result.counts).filter(n=>n>result.counts[d.id]).length));}for(const p of quiz.profiles){const reading=dom.querySelector(`[data-work-values-result-reading="${p.id}"]`);expect(Boolean(reading)).toBe(result.profileIds.includes(p.id));if(reading){reached.add(p.id);expect(reading.querySelectorAll('h4')).toHaveLength(7);for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(reading.textContent).toContain(t[locale]);}}expect(dom.querySelectorAll('[data-work-value-review] ol > li')).toHaveLength(30);expect(dom.querySelectorAll('[data-selected="true"]')).toHaveLength(30);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));}
  expect([...reached].sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
 });
});
