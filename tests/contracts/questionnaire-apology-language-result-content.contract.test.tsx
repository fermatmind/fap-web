import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/apology-language.json";
import content from "@/lib/questionnaires/result-content/apology-language.json";
import { apologyLanguageResultProfile } from "@/lib/questionnaires/result-content/apology-language";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireApologyPreferenceReport } from "@/components/questionnaires/QuestionnaireApologyPreferenceReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["neutral","all-na","one-na","rounding","low","high","near"] as const;
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q=>[q.id,mode === "all-na" ? "na" : mode === "low" ? "1" : mode === "high" || mode === "near" ? "5" : "3"]));
  if(mode === "one-na") a.APREF_01="na";
  if(mode === "rounding") [4,4,4,3].forEach((n,i)=>{a[`APREF_0${i+1}`]=String(n);});
  if(mode === "near") a.APREF_01="4";
  return a;
}
describe("Five separate original apology receiving-preference readings",()=>{
  it("preserves all source identity and six modules while adding distinct scenes and optional exercises",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(4);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=apologyLanguageResultProfile(p);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(v=>v[0].paragraphs[0][locale])).size).toBe(5);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(apologyLanguageResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps all five %s guides and separate importance means through skips, ties and rounding",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete facets required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireApologyPreferenceReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-apology-language-result-reading]")).toHaveLength(5);expect(root.querySelectorAll("h4")).toHaveLength(30);
      for(const p of quiz.profiles){const direction=p.directionIds[0],values=quiz.questions.filter(q=>q.options[0].directionId===direction&&answers[q.id]!=="na").map(q=>Number(answers[q.id])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),mean=rated===4?(Math.round(sum/4*10)/10).toFixed(1):null;
        expect(root.querySelector(`[data-apology-preference-score="${direction}"]`)?.textContent).toBe(mean===null?(locale==="zh"?`资料不足：${rated}/4题有重视程度回答，需要完整4题；本部分不计算均分。`:`Insufficient information: ${rated}/4 importance ratings; all four are required. No mean for this part.`):(locale==="zh"?`重视程度均分：${mean} / 5（${sum} ÷ ${rated}，显示一位小数）`:`Importance mean: ${mean} / 5 (${sum} ÷ ${rated}, displayed to one decimal)`));
        for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#apology-preference-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      }
      expect(result.facets.regret.mean).toBe(mode==="all-na"||mode==="one-na"?null:mode==="rounding"?3.8:mode==="near"?4.8:mode==="low"?1:mode==="high"?5:3);
      const ids=[...root.querySelectorAll("[id]")].map(v=>v.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders five complete public %s guides without personal ratings",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-apology-language-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-apology-preference-score]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
