import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/uncertainty-ease-reflection.json";
import content from "@/lib/questionnaires/result-content/uncertainty-ease-reflection.json";
import { uncertaintyEaseResultProfile } from "@/lib/questionnaires/result-content/uncertainty-ease-reflection";
import { isUncertaintyEase6ConfigurationValid, recordUncertaintyEase6 } from "@/lib/questionnaires/uncertaintyEase6";
import { UncertaintyEasePage, UncertaintyEaseGuidePage } from "@/components/questionnaires/UncertaintyEasePage";
import { UncertaintyEaseReport } from "@/components/questionnaires/UncertaintyEaseReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["not-now","partly","fits","unsure","na","withheld"];
describe("One full bilingual public readings with source records kept separate",()=>{
  it("preserves every source paragraph and strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=uncertaintyEaseResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isUncertaintyEase6ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(uncertaintyEaseResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens the complete %s full readings before answers without changing raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<UncertaintyEasePage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-uncertainty-ease-result-reading]")).toHaveLength(1);expect(entry.querySelectorAll("[data-uncertainty-ease-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-uncertainty-ease-result-reading] h3')).toHaveLength(7);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-uncertainty-ease-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-uncertainty-ease-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-uncertainty-ease-count]')).toBeNull();expect(root.querySelector('[data-uncertainty-ease-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#uncertainty-ease-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isUncertaintyEase6ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps counts, unscored state and all public %s paragraphs available after every label",locale=>{
    for(const mode of [...categories,"mixed"]){const a=Object.fromEntries(Array.from({length:6},(_,i)=>[`UNC_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode])),before=recordUncertaintyEase6(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<UncertaintyEaseReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-uncertainty-ease-theme]')).toHaveLength(1);expect(root.querySelectorAll('[data-uncertainty-ease-observation]')).toHaveLength(6);expect(root.querySelectorAll('[data-uncertainty-ease-count]')).toHaveLength(6);expect(root.querySelectorAll('[data-uncertainty-ease-unscored]')).toHaveLength(["unsure","na","withheld"].includes(mode)?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<UncertaintyEaseGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordUncertaintyEase6(quiz,a)).toEqual(before);expect(isUncertaintyEase6ConfigurationValid(quiz)).toBe(true);
    }
  });
});
