import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/skills-audit.json";
import content from "@/lib/questionnaires/result-content/skills-audit.json";
import { skillsAuditResultProfile } from "@/lib/questionnaires/result-content/skills-audit";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isSkillsEvidenceConfigurationValid, scoreSkillsEvidenceQuestionnaire, skillsEvidenceStates } from "@/lib/questionnaires/skillsEvidence";
import { QuestionnaireSkillsEvidenceReport } from "@/components/questionnaires/QuestionnaireSkillsEvidenceReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
function patterns(){const out:string[][]=[];for(let a=0;a<=5;a++)for(let b=0;b<=5-a;b++)for(let c=0;c<=5-a-b;c++)out.push([...Array<string>(a).fill("recent"),...Array<string>(b).fill("older"),...Array<string>(c).fill("explore"),...Array<string>(5-a-b-c).fill("na")]);return out;}
describe("Four full bilingual skills-example readings without ability inference",()=>{
  it("preserves source identities and all six original modules with immutable optional additions",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=skillsAuditResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}const unknown={...quiz.profiles[0],id:"__proto__"};expect(skillsAuditResultProfile(unknown)).toBe(unknown);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);expect(JSON.stringify(quiz)).toBe(before);expect(isSkillsEvidenceConfigurationValid(prepared)).toBe(true);
  });
  it.each(["zh","en"] as const)("opens all %s public modules and valid anchors without private rows",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-skills-audit-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-skills-audit-result-reading] h2')).toHaveLength(6);expect(dom.querySelector('[data-skills-evidence-count]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
  });
  it.each(["zh","en"] as const)("retains all56 possible five-task count arrangements, literal rows and full %s content",locale=>{
    expect(patterns()).toHaveLength(56);for(const states of patterns()){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,states[i%5]]));const result=scoreSkillsEvidenceQuestionnaire(prepared,answers);expect(result).toEqual(scoreSkillsEvidenceQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete inventory required");const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<QuestionnaireSkillsEvidenceReport quiz={prepared} result={result} locale={locale}/>);expect(dom.querySelectorAll('[data-skills-audit-result-reading] h4')).toHaveLength(24);expect(dom.querySelectorAll('[data-skills-evidence-row]')).toHaveLength(20);for(const part of result.skillsEvidence){for(const state of skillsEvidenceStates)expect(dom.querySelector(`[data-skills-evidence-count="${part.id}-${state}"]`)?.textContent).toBe(String(states.filter(s=>s===state).length));expect(part.rows.map(row=>row.stateId)).toEqual(states);}for(const p of quiz.profiles)for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`[data-skills-audit-result-reading="${p.id}"]`)?.textContent).toContain(t[locale]);}
  });
});
