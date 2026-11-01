import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/sensory-processing-test.json";
import content from "@/lib/questionnaires/result-content/sensory-processing-test.json";
import { sensoryProcessingResultProfile } from "@/lib/questionnaires/result-content/sensory-processing-test";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isSpq92ConfigurationValid, scoreSpq92Questionnaire } from "@/lib/questionnaires/spq92";
import { QuestionnaireSpq92Report } from "@/components/questionnaires/QuestionnaireSpq92Report";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
describe("Complete bilingual SPQ reading with independent original-key raw totals",()=>{
  it("preserves the full source paragraphs, identifiers and strict scoring eligibility",()=>{
    const before=JSON.stringify(quiz),p=quiz.profiles[0],r=sensoryProcessingResultProfile(p);expect(Object.keys(content)).toEqual([p.id]);expect(r.title).toEqual(p.title);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);expect(JSON.stringify(quiz)).toBe(before);expect(isSpq92ConfigurationValid(quiz)).toBe(true);expect(isSpq92ConfigurationValid(prepareQuestionnaireResultReadings(quiz))).toBe(true);const unknown={...p,id:"__proto__"};expect(sensoryProcessingResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens every %s added paragraph on the real public guide without private totals",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide"),p=quiz.profiles[0],root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector('[data-sensory-processing-result-reading]')).not.toBeNull();expect(root.querySelectorAll('[data-sensory-processing-result-reading] h2')).toHaveLength(6);expect(root.querySelector('[data-spq92-total]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==='en')expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
  });
  it.each(["zh","en"] as const)("keeps all 277 attainable %s totals and missing results beside the same six modules",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);for(const total of [...Array.from({length:277},(_,i)=>i),null]){let remaining=total??0;const answers=Object.fromEntries(quiz.questions.map(q=>{const contribution=Math.min(remaining,3);remaining-=contribution;return[q.id,total===null?'na':String(q.reverse?3-contribution:contribution)];}));const before=scoreSpq92Questionnaire(quiz,answers),result=scoreSpq92Questionnaire(prepared,answers);expect(result).toEqual(before);if(result.status!=='complete')throw Error('Complete witness required');expect(result.spq92.total).toBe(total);const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<QuestionnaireSpq92Report quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll('[data-sensory-processing-result-reading] h4')).toHaveLength(6);expect(root.querySelector('[data-spq92-total]')?.textContent).toContain(total===null?(locale==='zh'?'资料不足':'Insufficient information'):locale==='zh'?`${total}（`:`${total} (`);for(const s of content['spq92-total-reading'])for(const t of s.paragraphs)expect(root.textContent).toContain(t[locale]);}
    const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i===0?'na':'1']));const result=scoreSpq92Questionnaire(prepared,answers);expect(result.status).toBe('complete');if(result.status==='complete')expect(result.spq92).toEqual({rated:91,skipped:1,total:null});
  });
});
