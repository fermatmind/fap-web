import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/connection-ideals.json";
import content from "@/lib/questionnaires/result-content/connection-ideals.json";
import fixture from "@/tests/fixtures/questionnaires/connection-ideals-witnesses.json";
import { connectionIdealsResultProfile } from "@/lib/questionnaires/result-content/connection-ideals";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreArchetypeQuestionnaire, isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import { ConnectionIdealsReport } from "@/components/questionnaires/ConnectionIdealsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
describe("Six bilingual connection-ideal readings with every feasible highest tie",()=>{
 it("preserves source bodies, identities and counts across all57 independent witnesses",()=>{
  const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isArchetypeConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=connectionIdealsResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);expect(r.title).toEqual(p.title);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);}
  expect(fixture.witnesses).toHaveLength(57);for(const row of fixture.witnesses){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,row.answers[i]]));expect(scoreArchetypeQuestionnaire(prepared,answers)).toEqual(scoreArchetypeQuestionnaire(quiz,answers));}const unknown={...quiz.profiles[0],id:"__proto__"};expect(connectionIdealsResultProfile(unknown)).toBe(unknown);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens all six full %s public readings without personal counts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-connection-ideals-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-connection-ideals-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-ci-count]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains every full %s highest guide for all57 feasible sets, including six-way",locale=>{
  const prepared=prepareQuestionnaireResultReadings(quiz);
  for(const row of fixture.witnesses){const result=scoreArchetypeQuestionnaire(prepared,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,row.answers[i]])));if(result.status!=="complete")throw Error('Complete record required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<ConnectionIdealsReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll('[data-connection-ideals-result-reading]')).toHaveLength(row.leaders.length);expect(root.querySelectorAll('[data-ci-profile] h4')).toHaveLength(row.leaders.length*8);for(const p of quiz.profiles){const reading=root.querySelector(`[data-connection-ideals-result-reading="${p.id}"]`);expect(Boolean(reading)).toBe(row.leaders.includes(p.id));if(reading)for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(reading.textContent).toContain(t[locale]);expect(root.querySelector(`[data-ci-theme="${p.id}"] [data-ci-count]`)?.textContent).toBe(`${result.counts[p.id]} / 8`);}const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));}
 });
});
