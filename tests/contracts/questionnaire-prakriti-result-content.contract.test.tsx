import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/prakriti-inventory21.json";
import content from "@/lib/questionnaires/result-content/prakriti-inventory21.json";
import { prakritiInventoryResultProfile } from "@/lib/questionnaires/result-content/prakriti-inventory21";
import { prepareResultProfile, prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isBpi21ConfigurationValid, scoreBpi21 } from "@/lib/questionnaires/bpi21";
import { Bpi21Report } from "@/components/questionnaires/Bpi21Report";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const dom=(html:string)=>{const root=document.createElement("div");root.innerHTML=html;return root;};
describe("Three full bilingual BPI-21 readings without medical type assignment",()=>{
  it("preserves every source paragraph, identity, mapped alternative and count contract",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());expect(isBpi21ConfigurationValid(prepared)).toBe(true);
    for(const p of quiz.profiles){const r=prakritiInventoryResultProfile(p);expect(r.title).toEqual(p.title);expect(r.headline).toEqual(p.headline);expect(r.summary).toEqual(p.summary);expect(r.seo).toEqual(p.seo);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);const v=prepareResultProfile(quiz.slug,p);expect(prepareResultProfile(quiz.slug,v)).toBe(v);}
    expect(JSON.stringify(quiz)).toBe(before);expect(isBpi21ConfigurationValid(quiz)).toBe(true);expect(prepared.questions).toBe(quiz.questions);expect(prepared.source).toBe(quiz.source);expect(prepared.directions).toBe(quiz.directions);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prakritiInventoryResultProfile(unknown)).toBe(unknown);expect(new Set(Object.values(content).map(s=>s[0].paragraphs[0].en)).size).toBe(3);
  });
  it.each(["zh","en"] as const)("opens all three %s public guides without personal numbers",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=dom(renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));expect(root.querySelector(`[data-prakriti-inventory-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-prakriti-inventory-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-bpi21-count],[data-bpi21-percentage],input')).toBeNull();for(const s of prepareResultProfile(quiz.slug,p).sections)for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("keeps every full %s reading for single-column, equal, mixed and withheld records",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz);
    for(const mode of ["vata","pitta","kapha","equal","mixed","one-na","all-na"]){const values=Array.from({length:21},(_,i)=>mode==="all-na"||mode==="one-na"&&i===20?"na":mode==="mixed"?(i<11?"pitta":i<19?"vata":"kapha"):["equal","one-na"].includes(mode)?["vata","pitta","kapha"][i%3]:mode),answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]]));const before=scoreBpi21(quiz,answers),result=scoreBpi21(prepared,answers);expect(result).toEqual(before);if(result.status!=="complete")throw Error("Fixture failed");const root=dom(renderToStaticMarkup(<Bpi21Report quiz={prepared} result={result} locale={locale}/>));expect(root.querySelectorAll('[data-bpi21-profile]')).toHaveLength(3);expect(root.querySelectorAll('[data-bpi21-profile] h4')).toHaveLength(24);expect(root.querySelectorAll('[data-prakriti-inventory-result-reading]')).toHaveLength(3);expect(root.querySelectorAll('[data-bpi21-count],[data-bpi21-percentage]')).toHaveLength(result.counts?6:0);
      for(const p of prepared.profiles)for(const s of p.sections)for(const text of s.paragraphs)expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      if(result.counts)for(const id of ["vata","pitta","kapha"] as const){expect(root.querySelector(`[data-bpi21-record="${id}"] [data-bpi21-count]`)?.textContent).toBe(`${result.counts[id]} / 21`);expect(root.querySelector(`[data-bpi21-record="${id}"] [data-bpi21-percentage]`)?.textContent).toBe(`${result.percentages![id].toFixed(1)}%`);}else expect(root.querySelector('[data-bpi21-insufficient]')).not.toBeNull();
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
