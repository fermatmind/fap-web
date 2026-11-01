import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/work-ethics.json";
import content from "@/lib/questionnaires/result-content/work-ethics.json";
import { workEthicsResultProfile } from "@/lib/questionnaires/result-content/work-ethics";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireWorkHabitsReport } from "@/components/questionnaires/QuestionnaireWorkHabitsReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["neutral","all-na","one-na","rounding","low","high","near"] as const;
const reverseIds = new Set(["WCH_03","WCH_06","WCH_09","WCH_12","WCH_15","WCH_18","WCH_21","WCH_24"]);
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q=>[q.id,mode === "all-na" ? "na" : mode === "low" ? (reverseIds.has(q.id)?"5":"1") : mode === "high" || mode === "near" ? (reverseIds.has(q.id)?"1":"5") : "3"]));
  if(mode === "one-na") a.WCH_01="na";
  if(mode === "rounding") [4,4,2,4,4,3].forEach((n,i)=>{a[`WCH_0${i+1}`]=String(n);});
  if(mode === "near") a.WCH_01="4";
  return a;
}
describe("Four separate original work-ethics habit readings",()=>{
  it("preserves all source identity and six modules while adding distinct scenes and optional exercises",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(6);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=workEthicsResultProfile(p);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(v=>v[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(workEthicsResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps all four %s guides and separate keyed means through skips, ties and rounding",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete facets required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireWorkHabitsReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-work-ethics-result-reading]")).toHaveLength(4);expect(root.querySelectorAll("h4")).toHaveLength(24);
      for(const p of quiz.profiles){const direction=p.directionIds[0],values=quiz.questions.filter(q=>q.options[0].directionId===direction&&answers[q.id]!=="na").map(q=>reverseIds.has(q.id)?6-Number(answers[q.id]):Number(answers[q.id])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),mean=rated===6?(Math.round(sum/6*10)/10).toFixed(1):null;
        expect(root.querySelector(`[data-work-habits-score="${direction}"]`)?.textContent).toBe(mean===null?(locale==="zh"?`资料不足：${rated}/6题有数值回答；需要六题完整，不计算本组均分。`:`Insufficient information: ${rated}/6 items rated; all six are needed. No mean is calculated for this group.`):(locale==="zh"?`所选习惯均分：${mean} / 5（6/6题有效）`:`Selected-habit mean: ${mean} / 5 (6/6 items rated)`));
        for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#work-habits-report-${direction}-${s.id}`)?.textContent).toContain(text[locale]);
      }
      expect(result.facets.commitments.mean).toBe(mode==="all-na"||mode==="one-na"?null:mode==="rounding"?3.8:mode==="near"?4.8:mode==="low"?1:mode==="high"?5:3);
      const ids=[...root.querySelectorAll("[id]")].map(v=>v.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders four complete public %s guides without personal ratings",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-work-ethics-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-work-habits-score]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
