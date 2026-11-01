import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/political-coordinates.json";
import content from "@/lib/questionnaires/result-content/political-coordinates.json";
import { politicalCoordinatesResultProfile } from "@/lib/questionnaires/result-content/political-coordinates";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scorePoliticalCoordinatesQuestionnaire } from "@/lib/questionnaires/politicalCoordinates";
import { QuestionnairePoliticalCoordinatesReport } from "@/components/questionnaires/QuestionnairePoliticalCoordinatesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const cases=[[12,11],[14,6],[5,12],[7,5],[9,18],[9,0],[18,9],[0,9],[9,9],[18,18],[0,0]] as const;
function answersFor(e:number,s:number){return Object.fromEntries(Array.from({length:36},(_,i)=>[`POL_${String(i+1).padStart(3,"0")}`,i%2===0?(Math.floor(i/2)<e?"left":"right"):(Math.floor(i/2)<s?"communitarian":"liberal")]));}
describe("Four bilingual original policy comparisons with discussion cards",()=>{
  it("retains every source paragraph and eight-module identity",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(prepared.questions).toBe(quiz.questions);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());
    for(const p of quiz.profiles){const reading=politicalCoordinatesResultProfile(p);expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}
    for(const locale of ["zh","en"] as const)expect(new Set(Object.values(content).map(s=>s[0].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(politicalCoordinatesResultProfile(unknown)).toBe(unknown);
  });
  it("keeps all361 full count pairs and each zero-axis comparison unchanged",()=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(let e=0;e<=18;e++)for(let s=0;s<=18;s++){const a=answersFor(e,s),result=scorePoliticalCoordinatesQuestionnaire(prepared,a);expect(result).toEqual(scorePoliticalCoordinatesQuestionnaire(quiz,a));if(result.status!=="complete")throw Error("Complete result required");expect(result.politicalCoordinates.economic.difference).toBe(18-2*e);expect(result.politicalCoordinates.social.difference).toBe(18-2*s);expect(result.politicalCoordinateProfileIds).toEqual(quiz.profiles.filter(p=>(e===9||p.directionIds[0]===(e>9?"left":"right"))&&(s===9||p.directionIds[1]===(s>9?"communitarian":"liberal"))).map(p=>p.id));}
  });
  it.each(["zh","en"] as const)("renders all four full %s readings for signed, zero and missing axes",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    const states=cases.map(([e,s])=>answersFor(e,s));for(const mode of ["economic","social","all"]){const a=answersFor(12,7);for(let i=1;i<=36;i++)if(mode==="all"||(i%2===1?"economic":"social")===mode)a[`POL_${String(i).padStart(3,"0")}`]="na";states.push(a);}
    for(const a of states){const result=scorePoliticalCoordinatesQuestionnaire(prepared,a);if(result.status!=="complete")throw Error("Complete result required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnairePoliticalCoordinatesReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll("[data-political-result-reading]")).toHaveLength(4);expect(root.querySelectorAll("h4")).toHaveLength(32);
      for(const p of prepared.profiles){for(const s of content[p.id as keyof typeof content])for(const paragraph of s.paragraphs)expect(root.querySelector(`#political-report-${p.id}-${s.id}`)?.textContent).toContain(paragraph[locale]);expect(prepareResultProfile(quiz.slug,p)).toBe(p);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const link of root.querySelectorAll("nav a"))expect(ids).toContain(link.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("serves all four public %s guides without personal coordinates",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-political-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelector("[data-political-point]")).toBeNull();for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
  });
});
