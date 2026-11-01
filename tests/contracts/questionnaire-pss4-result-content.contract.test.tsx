import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/perceived-stress-scale-4.json";
import pss from "@/lib/questionnaires/data/stress-check-in-test.json";
import content from "@/lib/questionnaires/result-content/perceived-stress-scale-4.json";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { pss4ResultProfile } from "@/lib/questionnaires/result-content/perceived-stress-scale-4";
import { isStressReflection4ConfigurationValid, scoreStressReflection4Questionnaire } from "@/lib/questionnaires/stressReflection4";
import { isPss4ConfigurationValid, scorePss4Questionnaire } from "@/lib/questionnaires/pss4";
import { QuestionnaireStressCheckInReport } from "@/components/questionnaires/QuestionnaireStressCheckInReport";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source;
const witnesses=new Map<number,number[]>();
for(let a=0;a<5;a++)for(let b=0;b<5;b++)for(let c=0;c<5;c++)for(let d=0;d<5;d++)witnesses.set(a+4-b+4-c+d,[a,b,c,d]);
describe("One complete bilingual PSS4 reading without a changed scoring manuscript",()=>{
 it("preserves every original paragraph and raw strict configuration",()=>{
  const before=JSON.stringify(quiz),p=quiz.profiles[0],r=pss4ResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(15);expect(r.title).toEqual(p.title);expect(r.scoreReading).toEqual(p.scoreReading);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,2)).toEqual(s.paragraphs);expect(isPss4ConfigurationValid(quiz)).toBe(true);expect(JSON.stringify(quiz)).toBe(before);const unknown={...p,id:'__proto__'};expect(pss4ResultProfile(unknown)).toBe(unknown);
 });
 it.each(["zh","en"] as const)("opens full %s public guide with no personal total",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:quiz.profiles[0].id})}));expect(root.querySelector('[data-pss4-result-reading]')).not.toBeNull();expect(root.querySelectorAll('[data-pss4-result-reading] h2')).toHaveLength(6);expect(root.querySelector('[data-stress-check-in-total]')).toBeNull();for(const s of content['reading-pss4-total'])for(const p of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));
 });
 it.each(["zh","en"] as const)("keeps all17totals, same public %s text and separate PSS4 rendering",locale=>{
  if(!isPss4ConfigurationValid(quiz)||!isStressReflection4ConfigurationValid(pss))throw Error('Raw contracts required');const profile=prepareResultProfile(quiz.slug,quiz.profiles[0]);expect(witnesses.size).toBe(17);
  for(const [total,values]of witnesses){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,String(values[i])])),result=scorePss4Questionnaire(quiz,answers);if(result.status!=='complete')throw Error('Complete record required');expect(result.total).toBe(total);const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<QuestionnaireStressCheckInReport quiz={quiz} result={result} locale={locale} resultProfile={profile}/>);expect(root.querySelector('[data-stress-check-in-total]')?.textContent).toContain(`${total} / 16`);expect(root.querySelectorAll('[data-stress-check-in-contribution]')).toHaveLength(4);expect(root.querySelectorAll('[data-pss4-result-reading] h3')).toHaveLength(6);for(const s of content['reading-pss4-total'])for(const p of s.paragraphs)expect(root.textContent).toContain(p[locale]);expect(scorePss4Questionnaire(quiz,answers)).toEqual(result);}
  const result=scoreStressReflection4Questionnaire(pss,Object.fromEntries(pss.questions.map(q=>[q.id,'2'])));if(result.status!=='complete')throw Error('PSS4 required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<QuestionnaireStressCheckInReport quiz={pss} result={result} locale={locale} resultProfile={profile}/>);expect(root.querySelector('[data-pss4-result-reading]')).toBeNull();for(const s of pss.profiles[0].sections)for(const p of s.paragraphs)expect(root.textContent).toContain(p[locale]);
 });
});
