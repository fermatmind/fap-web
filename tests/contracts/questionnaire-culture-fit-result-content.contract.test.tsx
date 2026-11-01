import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/culture-fit.json";
import content from "@/lib/questionnaires/result-content/culture-fit.json";
import { cultureFitResultProfile } from "@/lib/questionnaires/result-content/culture-fit";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireWorkArrangementReport } from "@/components/questionnaires/QuestionnaireWorkArrangementReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["neutral","all-na","one-na","rounding","low","high","near","mixed"] as const;
const reverseIds = new Set(Array.from({length:12},(_,i)=>`WARR_${String(2*i+2).padStart(2,"0")}`));
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q=>[q.id,mode === "all-na" ? "na" : mode === "low" ? (reverseIds.has(q.id)?"5":"1") : mode === "high" || mode === "near" ? (reverseIds.has(q.id)?"1":"5") : "3"]));
  if(mode === "one-na") a.WARR_01="na";
  if(mode === "rounding") [4,2,4,2,4,3].forEach((n,i)=>{a[`WARR_0${i+1}`]=String(n);});
  if(mode === "near") a.WARR_01="4";
  if(mode === "mixed") [1,5,1,1,5,1].forEach((n,i)=>{a[`WARR_0${i+1}`]=String(n);});
  return a;
}
describe("Four separate original culture-fit habit readings",()=>{
  it("preserves all source identity and six modules while adding distinct scenes and optional exercises",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(6);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=cultureFitResultProfile(p);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(v=>v[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(cultureFitResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps all four %s guides and separate keyed means through skips, ties and rounding",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete facets required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireWorkArrangementReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-culture-fit-result-reading]")).toHaveLength(4);expect(root.querySelectorAll("h4")).toHaveLength(24);
      for(const p of quiz.profiles){const direction=p.directionIds[0],values=quiz.questions.filter(q=>q.options[0].directionId===direction&&answers[q.id]!=="na").map(q=>reverseIds.has(q.id)?6-Number(answers[q.id]):Number(answers[q.id])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),mean=rated===6?(Math.round(sum/6*10)/10).toFixed(1):null;
        expect(root.querySelector(`[data-work-arrangement-score="${direction}"]`)?.textContent).toBe(mean===null?(locale==="zh"?`资料不足：${rated}/6题有数值回答；需要六题完整，不计算本组位置均值。`:`Insufficient information: ${rated}/6 items rated; all six are needed. No position mean is calculated for this group.`):(locale==="zh"?`位置均值：${mean} / 5（6/6题有效）`:`Position mean: ${mean} / 5 (6/6 items rated)`));
        for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#work-arrangement-report-${direction}-${s.id}`)?.textContent).toContain(text[locale]);
      }
      expect(result.facets.coordination.mean).toBe(mode==="all-na"||mode==="one-na"?null:mode==="rounding"?3.8:mode==="near"?4.8:mode==="low"?1:mode==="high"?5:3);
      if(mode === "mixed") {
        expect([answers.WARR_01,answers.WARR_02,answers.WARR_03,answers.WARR_04,answers.WARR_05,answers.WARR_06]).not.toEqual(Array(6).fill("3"));
        expect(result.facets.coordination).toEqual({sum:18,rated:6,total:6,mean:3});
      }
      for(const part of root.querySelectorAll("[data-work-arrangement-part]")) expect([...part.querySelectorAll("dl dt")].map(n=>n.textContent)).toEqual(["1.0","5.0"]);
      const ids=[...root.querySelectorAll("[id]")].map(v=>v.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders four complete public %s guides without personal ratings",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-culture-fit-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-work-arrangement-score]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
