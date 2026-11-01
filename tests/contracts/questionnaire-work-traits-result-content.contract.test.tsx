import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/work-traits-reflection.json";
import content from "@/lib/questionnaires/result-content/work-traits-reflection.json";
import { workTraitsResultProfile } from "@/lib/questionnaires/result-content/work-traits-reflection";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isLikertConfigurationValid, scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { WorkTraitsReport } from "@/components/questionnaires/WorkTraitsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
describe("Seven full work-theme readings with opportunity-based frequency kept separate",()=>{
  it("preserves every original paragraph, identity and raw scoring configuration",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=workTraitsResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,2)).toEqual(s.paragraphs);}const unknown={...quiz.profiles[0],id:"__proto__"};expect(workTraitsResultProfile(unknown)).toBe(unknown);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);expect(JSON.stringify(quiz)).toBe(before);expect(isLikertConfigurationValid(prepared)).toBe(true);
  });
  it.each(["zh","en"] as const)("opens all %s public modules and anchors without personal means",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-work-traits-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-work-traits-result-reading] h2')).toHaveLength(7);expect(dom.querySelector('[data-work-traits-mean]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
  });
  it.each(["zh","en"] as const)("keeps sums, all0..6 coverage boundaries and complete %s guides independently",locale=>{
    for(let rated=0;rated<=6;rated++){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,Math.floor(i/7)<rated?String(Math.floor(i/7)%5+1):"na"]));const result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete record required");const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<WorkTraitsReport quiz={prepared} result={result} locale={locale}/>);expect(dom.querySelectorAll('[data-work-traits-result-reading] h4')).toHaveLength(49);const sum=Array.from({length:rated},(_,i)=>i%5+1).reduce((a,b)=>a+b,0);for(const d of quiz.directions){expect(result.facets[d.id]).toEqual({rated,sum,total:6,mean:rated>=5?Math.round(sum/rated*10)/10:null});expect(dom.querySelector(`[data-work-traits-coverage="${d.id}"]`)?.textContent).toContain(`${rated}/6`);expect(dom.querySelector(`[data-work-traits-mean="${d.id}"]`)?.textContent).toContain(rated>=5?`${(Math.round(sum/rated*10)/10).toFixed(1)} / 5`:(locale==="zh"?"资料不足":"Insufficient information"));}for(const p of quiz.profiles)for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(dom.querySelector(`[data-work-traits-result-reading="${p.id}"]`)?.textContent).toContain(t[locale]);}
  });
});
