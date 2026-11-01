import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/empathy.json";
import content from "@/lib/questionnaires/result-content/empathy.json";
import { empathyResultProfile } from "@/lib/questionnaires/result-content/empathy";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireCompassionReport } from "@/components/questionnaires/QuestionnaireCompassionReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const cases = ["4231524342", "4151515151", "1111111111", "n231524342", "nnnnnnnnnn", "1515151515", "5151515151"];
const numericKey = [[1,2,3,4,5],[5,4,3,2,1]];
describe("One continuous Compassion reading with optional discussion material", () => {
  it("preserves the ten source items, one profile and all twelve original modules", () => {
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz),p=quiz.profiles[0],reading=empathyResultProfile(p);
    expect(prepared.questions).toBe(quiz.questions);expect(prepared.minimumRatedItems).toBe(10);expect(Object.keys(content)).toEqual([p.id]);
    expect(reading.title).toEqual(p.title);expect(reading.directionIds).toEqual(p.directionIds);expect(reading.scoreReading).toEqual(p.scoreReading);expect(reading.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(reading.sections.flatMap(s=>s.paragraphs)).toHaveLength(27);
    for(const s of p.sections)expect(reading.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);
    expect(JSON.stringify(quiz)).toBe(before);const unknown={...p,id:"__proto__"};expect(empathyResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("keeps the complete %s guide at different totals and without personal numbers",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const raw of cases){const answers=Object.fromEntries([...raw].map((n,i)=>[`COMP10_${String(i+1).padStart(2,"0")}`,n==="n"?"na":n])),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=="complete")throw Error("Complete result required");
      const contributions=[...raw].map((n,i)=>n==="n"?null:numericKey[i%2][Number(n)-1]),rated=contributions.filter(v=>v!==null).length,sum=contributions.reduce<number>((a,b)=>a+(b??0),0),total=rated===10?sum:null;
      expect(result.facets.compassion).toEqual({sum,rated,total:10,mean:total===null?null:total/10});
      const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<QuestionnaireCompassionReport quiz={prepared} result={result} locale={locale}/>);
      const missing=locale==="zh"?"资料不足":"Insufficient information";
      expect(root.querySelector("[data-compassion-total]")?.textContent).toBe(total===null?missing:String(total));expect(root.querySelector("[data-compassion-mean]")?.textContent).toBe(total===null?missing:`${(total/10).toFixed(1)} / 5`);
      expect(root.querySelector("[data-compassion-rated]")?.textContent).toBe(locale==="zh"?`${rated} / 10题有效`:`${rated} / 10 rated items`);expect(root.querySelectorAll("[data-compassion-result-reading]")).toHaveLength(1);expect(root.querySelectorAll("h4")).toHaveLength(12);
      for(const s of content["compassion-reading"])for(const p of s.paragraphs)expect(root.querySelector(`#compassion-report-compassion-reading-${s.id}`)?.textContent).toContain(p[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("renders the complete public %s guide without a personal total",async locale=>{
    const guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"),root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await guide.default({params:Promise.resolve({locale,slug:quiz.slug,profile:"compassion-reading"})}));
    expect(root.querySelector('[data-compassion-result-reading="compassion-reading"]')).not.toBeNull();expect(root.querySelector("[data-compassion-total]")).toBeNull();for(const s of content["compassion-reading"])for(const p of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
  });
});
