import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/libertarian.json";
import content from "@/lib/questionnaires/result-content/libertarian.json";
import { libertarianResultProfile } from "@/lib/questionnaires/result-content/libertarian";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireLibertyPrinciplesReport } from "@/components/questionnaires/QuestionnaireLibertyPrinciplesReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["neutral","all-na","one-na","rounding","low","high","near"] as const;
const reverseIds = new Set(Array.from({length:32},(_,i)=>i).filter(i=>Math.floor(i/4)%2===1).map(i=>`LIB_${String(i+1).padStart(3,"0")}`));
function answersFor(mode: typeof modes[number]) {
  const a = Object.fromEntries(quiz.questions.map(q=>[q.id,mode === "all-na" ? "na" : mode === "low" ? (reverseIds.has(q.id)?"5":"1") : mode === "high" || mode === "near" ? (reverseIds.has(q.id)?"1":"5") : "3"]));
  if(mode === "one-na") a.LIB_001="na";
  if(mode === "rounding") [4,2,5,3,4,2,3,2].forEach((n,i)=>{a[`LIB_${String(i*4+1).padStart(3,"0")}`]=String(n);});
  if(mode === "near") a.LIB_001="4";
  return a;
}
describe("Four original political-principle readings with discussion prompts",()=>{
  it("preserves all source identity and eight modules while adding distinct scenes and optional exercises",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(8);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=libertarianResultProfile(p);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(v=>v[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(libertarianResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps all four %s guides and separate keyed means through skips, ties and rounding",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete facets required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireLibertyPrinciplesReport quiz={prepared} result={result} locale={locale}/>);
      expect(root.querySelectorAll("[data-liberty-result-reading]")).toHaveLength(4);expect(root.querySelectorAll("h4")).toHaveLength(32);
      for(const p of quiz.profiles){const direction=p.directionIds[0],values=quiz.questions.filter(q=>q.options[0].directionId===direction&&answers[q.id]!=="na").map(q=>reverseIds.has(q.id)?6-Number(answers[q.id]):Number(answers[q.id])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),mean=rated===8?(sum/8).toFixed(2):null;
        const summary=root.querySelector(`[data-liberty-domain="${direction}"]`)!;
        expect(summary.querySelector("[data-liberty-mean]")?.textContent).toBe(mean===null?(locale==="zh"?"资料不足":"Insufficient information"):`${mean} / 5`);
        expect(summary.querySelector("[data-liberty-sum]")?.textContent).toBe(mean===null?(locale==="zh"?"资料不足":"Insufficient information"):String(sum));
        expect(summary.querySelector("[data-liberty-rated]")?.textContent).toBe(locale==="zh"?`${rated} / 8条有效回答`:`${rated} / 8 rated items`);
        for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${direction}-${s.id}`)?.textContent).toContain(text[locale]);
      }
      expect(result.facets["autonomy"].mean).toBe(mode==="all-na"||mode==="one-na"?null:mode==="rounding"?3.9:mode==="near"?4.9:mode==="low"?1:mode==="high"?5:3);

      const ids=[...root.querySelectorAll("[id]")].map(v=>v.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders four complete public %s guides without personal ratings",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-liberty-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-liberty-domain]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
