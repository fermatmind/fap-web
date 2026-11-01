import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/self-esteem.json";
import content from "@/lib/questionnaires/result-content/self-esteem.json";
import { selfEsteemResultProfile } from "@/lib/questionnaires/result-content/self-esteem";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scoreRosenbergQuestionnaire } from "@/lib/questionnaires/rosenberg";
import { QuestionnaireRosenbergReport } from "@/components/questionnaires/QuestionnaireRosenbergReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
function answersFor(total:number){let remaining=total;return Object.fromEntries(Array.from({length:10},(_,i)=>{const value=Math.min(3,remaining);remaining-=value;return [`RSES_${String(i+1).padStart(2,"0")}`,([1,2,4,6,7].includes(i+1)?["sd","d","a","sa"]:["sa","a","d","sd"])[value]];}));}
describe("One full-range bilingual RSES guide with original discussion material",()=>{
  it("preserves every original paragraph, identity and seven modules",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(Object.keys(content)).toEqual(["score-reading"]);
    const p=quiz.profiles[0],reading=selfEsteemResultProfile(p);expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);expect(prepareResultProfile(quiz.slug,prepared.profiles[0])).toBe(prepared.profiles[0]);expect(JSON.stringify(quiz)).toBe(before);const unknown={...p,id:"__proto__"};expect(selfEsteemResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps the same full %s reading at all31totals and skipped states",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz),cases=Array.from({length:31},(_,n)=>answersFor(n));const one=answersFor(0);one.RSES_01="na";cases.push(one,Object.fromEntries(quiz.questions.map(q=>[q.id,"na"])));
    for(const [i,a]of cases.entries()){const result=scoreRosenbergQuestionnaire(prepared,a);expect(result).toEqual(scoreRosenbergQuestionnaire(quiz,a));if(result.status!=="complete")throw Error("Complete report required");expect(result.rosenberg.total).toBe(i<31?i:null);
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireRosenbergReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-rosenberg-result-reading]")).toHaveLength(1);expect(root.querySelectorAll("h4")).toHaveLength(7);const score=result.rosenberg;
      expect(root.querySelector("[data-rosenberg-score]")?.textContent).toBe(score.total===null?(locale==="zh"?`资料不足：${score.rated}/10 题有量表回答；${score.skipped}题跳过，不计算总分。`:`Insufficient information: ${score.rated}/10 scale responses; ${score.skipped} skipped. No total is calculated.`):(locale==="zh"?`${i} / 30（10/10题有效）`:`${i} / 30 (10/10 scale responses)`));
      for(const s of content["score-reading"])for(const text of s.paragraphs)expect(root.querySelector(`#rses-score-reading-${s.id}`)?.textContent).toContain(text[locale]);const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const link of root.querySelectorAll("nav a"))expect(ids).toContain(link.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("serves the public %s guide without personal scores",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:"score-reading"})}));expect(root.querySelector('[data-rosenberg-result-reading="score-reading"]')).not.toBeNull();expect(root.querySelector("[data-rosenberg-score]")).toBeNull();for(const s of content["score-reading"])for(const p of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
  });
});
