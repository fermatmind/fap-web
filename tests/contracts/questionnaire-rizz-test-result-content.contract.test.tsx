import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/rizz-test.json";
import content from "@/lib/questionnaires/result-content/rizz-test.json";
import { rizzResultProfile } from "@/lib/questionnaires/result-content/rizz-test";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireRizzReport } from "@/components/questionnaires/QuestionnaireRizzReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["neutral","all-na","two-rated","three-rated","rounding","low","high"] as const;
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q=>[q.id,mode === "all-na" ? "na" : mode === "low" ? "1" : mode === "high" ? "5" : "3"]));
  const ids = ["RIZ_01","RIZ_05","RIZ_09","RIZ_13","RIZ_17"];
  if(mode === "two-rated" || mode === "three-rated" || mode === "rounding") {
    const values = mode === "two-rated" ? ["2","4","na","na","na"] : mode === "three-rated" ? ["2","4","1","na","na"] : ["5","5","4","3","na"];
    ids.forEach((id,i)=>{a[id]=values[i];});
  }
  return a;
}
describe("Four separate original Rizz practice readings",()=>{
  it("retains all source paragraphs, identity and nine modules with individual new scenes",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(3);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=rizzResultProfile(p);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(12);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(v=>v[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(rizzResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps all four complete %s readings through minimum-rated thresholds and display rounding",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete facets required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireRizzReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-rizz-result-reading]")).toHaveLength(4);expect(root.querySelectorAll("h4")).toHaveLength(36);
      for(const p of quiz.profiles){const values=quiz.questions.filter(q=>q.options[0].directionId===p.id&&answers[q.id]!=="na").map(q=>Number(answers[q.id])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),mean=rated>=3?(Math.round(sum/rated*10)/10).toFixed(1):null;
        const text=root.querySelector(`[data-facet-score="${p.id}"]`)?.textContent;
        expect(text).toBe(mean===null?(locale==="zh"?`资料不足：${rated}/5题有频率回答，本版至少需要3题；不计算个人均分。`:`Insufficient information: ${rated}/5 items rated; this edition needs at least 3. No personal mean is calculated.`):(locale==="zh"?`有效频率均分：${mean} / 5（${rated}/5题有效）`:`Rated-frequency mean: ${mean} / 5 (${rated}/5 items rated)`));
        for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      }
      expect(result.facets["showing-interest"].mean).toBe(mode==="two-rated"||mode==="all-na"?null:mode==="three-rated"?2.3:mode==="rounding"?4.3:mode==="low"?1:mode==="high"?5:3);
      const ids=[...root.querySelectorAll("[id]")].map(v=>v.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders four complete public %s guides without personal ratings",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-rizz-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-facet-score]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
