import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/perfectionism.json";
import content from "@/lib/questionnaires/result-content/perfectionism.json";
import { perfectionismResultProfile } from "@/lib/questionnaires/result-content/perfectionism";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireSapsReport } from "@/components/questionnaires/QuestionnaireSapsReport";
import { scoreSapsQuestionnaire } from "@/lib/questionnaires/saps";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const groups={standards:[1,3,5,7],discrepancy:[2,4,6,8]};
function answersFor(s:number,d:number){const a:Record<string,string>={};for(const [id,numbers]of Object.entries(groups)){let remaining=(id==="standards"?s:d)-4;for(const n of numbers){const extra=Math.min(6,remaining);remaining-=extra;a[`saps-${String(n).padStart(2,"0")}`]=String(1+extra);}}return a;}
describe("Two full bilingual SAPS guides with original discussion cards",()=>{
  it("preserves every original paragraph and eight-module identity",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=perfectionismResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(19);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(perfectionismResultProfile(unknown)).toBe(unknown);
  });
  it("preserves all625 paired four-item sums with separate means and no extra metric",()=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);for(let s=4;s<=28;s++)for(let d=4;d<=28;d++){const a=answersFor(s,d),result=scoreSapsQuestionnaire(prepared,a);expect(result).toEqual(scoreSapsQuestionnaire(quiz,a));expect(result).toEqual({status:"complete",answered:8,sapsDomains:{standards:{sum:s,mean:s/4,rated:4,total:4},discrepancy:{sum:d,mean:d/4,rated:4,total:4}}});}
  });
  it.each(["zh","en"] as const)("shows complete %s readings at seven-point endpoints and quarter-point means",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);for(const [s,d]of [[4,4],[28,28],[4,28],[28,4],[16,16],[5,27],[17,15]]){const result=scoreSapsQuestionnaire(prepared,answersFor(s,d));if(result.status!=="complete")throw Error("Complete SAPS result required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireSapsReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-saps-result-reading]")).toHaveLength(2);expect(root.querySelectorAll("h4")).toHaveLength(16);for(const [id,sum]of [["standards",s],["discrepancy",d]] as const){expect(root.querySelector(`[data-saps-mean="${id}"]`)?.textContent).toBe(locale==="zh"?`四题均值：${(sum/4).toFixed(2)}（范围 1—7；4/4题有效）`:`Four-item mean: ${(sum/4).toFixed(2)} (range 1–7; 4/4 valid)`);expect(root.querySelector(`[data-saps-sum="${id}"]`)?.textContent).toBe(locale==="zh"?`四题原始总和：${sum}（范围 4—28）。均值是总和除以4，不是人群百分位。`:`Four-item raw sum: ${sum} (range 4–28). The mean is the sum divided by four, not a population percentile.`);}for(const p of quiz.profiles)for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#saps-reading-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
  });
  it.each(["zh","en"] as const)("serves both full public %s guides without personal sums and means",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-saps-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-saps-mean]")).toBeNull();expect(root.querySelector('[data-saps-attribution]')?.textContent).toContain('2014');for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
