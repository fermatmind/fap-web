import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/conservatism.json";
import content from "@/lib/questionnaires/result-content/conservatism.json";
import { conservatismResultProfile } from "@/lib/questionnaires/result-content/conservatism";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireSecsReport } from "@/components/questionnaires/QuestionnaireSecsReport";
import { scoreSecsQuestionnaire } from "@/lib/questionnaires/secs";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const groups={social:[1,3,4,7,8,11,12],economic:[2,5,6,9,10]} as const;
const modes=["neutral","worked","reversed","raw-zero","low","high","social-na","economic-na","all-na"] as const;
function answersFor(mode:typeof modes[number]){
  const a=Object.fromEntries(Array.from({length:12},(_,i)=>[`SECS_${String(i+1).padStart(2,"0")}`,mode==="all-na"?"na":mode==="raw-zero"?"0":mode==="low"?(i===0||i===4?"100":"0"):mode==="high"?(i===0||i===4?"0":"100"):"50"]));
  if(mode==="worked"||mode==="reversed"){a.SECS_01=mode==="worked"?"20":"80";a.SECS_05=mode==="worked"?"80":"20";}
  if(mode==="social-na")a.SECS_01="na";if(mode==="economic-na")a.SECS_05="na";return a;
}
describe("Two complete historical SECS readings with original discussion cards",()=>{
  it("keeps the original twelve terms, source grouping, keys and eight modules untouched",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(prepared.kind).toBe("secs");expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=conservatismResultProfile(p);expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(conservatismResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps complete %s readings at valid zero, opposite keys and either missing domain",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of modes){const answers=answersFor(mode),result=scoreSecsQuestionnaire(prepared,answers);expect(result).toEqual(scoreSecsQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete SECS report required");
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireSecsReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-secs-result-reading]")).toHaveLength(2);expect(root.querySelectorAll("h4")).toHaveLength(16);
      for(const [id,numbers]of Object.entries(groups)){const values=numbers.map(n=>answers[`SECS_${String(n).padStart(2,"0")}`]).map((v,i)=>v==="na"?null:numbers[i]===1||numbers[i]===5?100-Number(v):Number(v)),rated=values.filter(v=>v!==null).length,sum=values.reduce<number>((a,b)=>a+(b??0),0),total=numbers.length,complete=rated===total;
        expect(result.secsDomains[id as keyof typeof groups]).toEqual({rated,total,sum:complete?sum:null,mean:complete?sum/total:null});const card=root.querySelector(`[data-secs-domain="${id}"]`)!,missing=locale==="zh"?"资料不足":"Insufficient information";
        expect(card.querySelector("[data-secs-sum]")?.textContent).toBe(complete?String(sum):missing);expect(card.querySelector("[data-secs-mean]")?.textContent).toBe(complete?`${(sum/total).toFixed(2)} / 100`:missing);expect(card.querySelector("[data-secs-rated]")?.textContent).toBe(locale==="zh"?`${rated} / ${total}项有效温度评分`:`${rated} / ${total} rated warmth items`);
      }
      for(const p of quiz.profiles)for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("serves both complete public %s guides without personal warmth",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-secs-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-secs-mean]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
