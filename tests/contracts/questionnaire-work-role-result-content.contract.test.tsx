import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/work-role-reflection.json";
import content from "@/lib/questionnaires/result-content/work-role-reflection.json";
import { workRoleResultProfile } from "@/lib/questionnaires/result-content/work-role-reflection";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { isWorkRole12ConfigurationValid, recordWorkRole12, workRoleStates, workRoleLabels } from "@/lib/questionnaires/workRole12";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireWorkRoleReport } from "@/components/questionnaires/QuestionnaireWorkRoleReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const profiles=quiz.profiles.map(p=>prepareResultProfile(quiz.slug,p));
describe("Three complete bilingual work-role readings with raw categorical configuration",()=>{
  it("preserves raw identities, fourteen paragraphs, strict input and unknown fallbacks",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=workRoleResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,2)).toEqual(s.paragraphs);}const unknown={...quiz.profiles[0],id:"__proto__"};expect(workRoleResultProfile(unknown)).toBe(unknown);expect(JSON.stringify(quiz)).toBe(before);expect(isWorkRole12ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("opens every %s full public guide before answering without private rows",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-work-role-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-work-role-result-reading] h2')).toHaveLength(7);expect(dom.querySelector('[data-work-role-count]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
  });
  it.each(["zh","en"] as const)("keeps all256 category arrangements in each group and guards %s reading selection",locale=>{
    const baseline=recordWorkRole12(quiz,Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])));
    if(baseline.status!=="complete")throw Error("Complete result required");
    // Every arrangement still renders the full report. Validate the invariant readings
    // once, then require their exact markup in every render before parsing the rows.
    const readings=baseline.workRole.map(part=>{
      const profile=profiles.find(p=>p.id===part.profileId)!;
      const html=renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`work-role-reading-${part.id}`}/>);
      const dom=document.createElement("div");dom.innerHTML=html;
      expect(dom.querySelectorAll('[data-work-role-result-reading] h4')).toHaveLength(7);
      for(const section of content[profile.id as keyof typeof content])for(const paragraph of section.paragraphs)expect(dom.textContent).toContain(paragraph[locale]);
      return html;
    });
    for(let n=0;n<256;n++){const states=Array.from({length:4},(_,i)=>workRoleStates[Math.floor(n/(4**i))%4]);const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,states[i%4]]));const result=recordWorkRole12(quiz,answers);if(result.status!=="complete")throw Error("Complete result required");const html=renderToStaticMarkup(<QuestionnaireWorkRoleReport quiz={quiz} result={result} locale={locale} readingProfiles={profiles}/>);let rowsHtml=html;for(const reading of readings){expect(rowsHtml).toContain(reading);rowsHtml=rowsHtml.replace(reading,"");}const dom=document.createElement("div");dom.innerHTML=rowsHtml;expect(dom.querySelectorAll('[data-work-role-row]')).toHaveLength(12);for(const part of result.workRole){for(const state of workRoleStates)expect(dom.querySelector(`[data-work-role-count="${part.id}-${state}"]`)?.textContent).toBe(String(states.filter(s=>s===state).length));for(const row of part.rows)expect(dom.querySelector(`[data-work-role-state="${row.questionId}"]`)?.textContent).toBe(workRoleLabels[row.stateId][locale]);}expect(isWorkRole12ConfigurationValid(quiz)).toBe(true);}
    const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])),result=recordWorkRole12(quiz,answers);if(result.status!=="complete")throw Error("Complete result required");const bad=profiles.map(p=>({...p,resultReading:{...p.resultReading!,quizSlug:"other"}}));const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireWorkRoleReport quiz={quiz} result={result} locale={locale} readingProfiles={bad}/>);expect(dom.querySelector('[data-work-role-result-reading]')).toBeNull();for(const p of quiz.profiles)for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);
  });
});
