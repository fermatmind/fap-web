import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/burnout-risk.json";
import content from "@/lib/questionnaires/result-content/burnout-risk.json";
import { burnoutRiskResultProfile } from "@/lib/questionnaires/result-content/burnout-risk";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireCbiReport } from "@/components/questionnaires/QuestionnaireCbiReport";
import { scoreCbiQuestionnaire } from "@/lib/questionnaires/cbi";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const ids={personal:Array.from({length:6},(_,i)=>`CBI_P_0${i+1}`),work:Array.from({length:7},(_,i)=>`CBI_W_0${i+1}`)};
function answersFor(mode:string){const a=Object.fromEntries([...ids.personal,...ids.work].map(id=>[id,mode==="all-na"||mode==="partial"||mode==="below"?"na":mode==="low"?"0":mode==="high"?"100":"50"]));
  if(mode==="low"||mode==="high")a.CBI_W_07=mode==="low"?"100":"0";
  if(mode==="worked"){[100,75,50,75,25,75].forEach((v,i)=>{a[ids.personal[i]]=String(v);});[75,50,25,100,75,0,100].forEach((v,i)=>{a[ids.work[i]]=String(v);});}
  if(mode==="partial"||mode==="below"){ids.personal.slice(0,mode==="partial"?3:2).forEach(id=>{a[id]="0";});ids.work.slice(0,mode==="partial"?4:3).forEach(id=>{a[id]="0";});}
  if(mode==="one-na")a.CBI_P_01="na";return a;
}
describe("Two complete bilingual CBI guides with original conversation material",()=>{
  it("preserves eight source modules, all original paragraphs and identities",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=burnoutRiskResultProfile(p);expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(burnoutRiskResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("retains exact %s valid-count means at source minima, examples and missing responses",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of ["middle","worked","partial","below","one-na","all-na","low","high"]){const answers=answersFor(mode),result=scoreCbiQuestionnaire(prepared,answers);expect(result).toEqual(scoreCbiQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete CBI report required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireCbiReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-cbi-result-reading]")).toHaveLength(2);expect(root.querySelectorAll("h4")).toHaveLength(16);expect(root.querySelector('[data-cbi-attribution]')?.closest('details')).toBeNull();expect(root.querySelector('[data-cbi-attribution]')?.textContent).toContain('2006;34:49–58');
      for(const [id,group]of Object.entries(ids)){const values=group.filter(k=>answers[k]!=="na").map(k=>k==="CBI_W_07"?100-Number(answers[k]):Number(answers[k])),rated=values.length,sum=values.reduce((a,b)=>a+b,0),minimum=id==="personal"?3:4,total=group.length,sufficient=rated>=minimum;expect(result.cbiDomains[id as keyof typeof ids]).toEqual({rated,total,minimum,sum:sufficient?sum:null,mean:sufficient?sum/rated:null});const card=root.querySelector(`[data-cbi-domain="${id}"]`)!,missing=locale==="zh"?"资料不足":"Insufficient information";expect(card.querySelector("[data-cbi-sum]")?.textContent).toBe(sufficient?String(sum):missing);expect(card.querySelector("[data-cbi-mean]")?.textContent).toBe(sufficient?`${(sum/rated).toFixed(2)} / 100`:missing);expect(card.querySelector("[data-cbi-rated]")?.textContent).toBe(locale==="zh"?`${rated} / ${total}项有效；至少${minimum}项`:`${rated} / ${total} rated; minimum ${minimum}`);}
      for(const p of quiz.profiles)for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);const all=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(all).size).toBe(all.length);for(const a of root.querySelectorAll("nav a"))expect(all).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("serves both public %s guides without personal means",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-cbi-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-cbi-mean]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
