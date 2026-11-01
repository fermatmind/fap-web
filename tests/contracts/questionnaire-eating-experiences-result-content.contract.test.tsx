import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/eating-experiences-reflection.json";
import content from "@/lib/questionnaires/result-content/eating-experiences-reflection.json";
import { eatingExperiencesResultProfile } from "@/lib/questionnaires/result-content/eating-experiences-reflection";
import { isEatingExperiences20ConfigurationValid, recordEatingExperiences20 } from "@/lib/questionnaires/eatingExperiences20";
import { EatingExperiencesPage, EatingExperiencesGuidePage } from "@/components/questionnaires/EatingExperiencesPage";
import { EatingExperiencesReport } from "@/components/questionnaires/EatingExperiencesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["not-now","partly","fits","unsure","na","withheld"];
describe("Five full bilingual public readings with source records kept separate",()=>{
  it("preserves every source paragraph and strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=eatingExperiencesResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isEatingExperiences20ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(eatingExperiencesResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all five %s full readings before answers without changing raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<EatingExperiencesPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-eating-experiences-result-reading]")).toHaveLength(5);expect(entry.querySelectorAll("[data-eating-experiences-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-eating-experiences-result-reading] h3')).toHaveLength(35);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-eating-experiences-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-eating-experiences-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-eating-experiences-count]')).toBeNull();expect(root.querySelector('[data-eating-experiences-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#eating-experiences-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isEatingExperiences20ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps counts, unscored state and all public %s paragraphs available after every label",locale=>{
    for(const mode of [...categories,"mixed"]){const a=Object.fromEntries(Array.from({length:20},(_,i)=>[`EAT_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode])),before=recordEatingExperiences20(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<EatingExperiencesReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-eating-experiences-theme]')).toHaveLength(5);expect(root.querySelectorAll('[data-eating-experiences-observation]')).toHaveLength(20);expect(root.querySelectorAll('[data-eating-experiences-count]')).toHaveLength(30);expect(root.querySelectorAll('[data-eating-experiences-unscored]')).toHaveLength(["unsure","na","withheld"].includes(mode)?5:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<EatingExperiencesGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordEatingExperiences20(quiz,a)).toEqual(before);expect(isEatingExperiences20ConfigurationValid(quiz)).toBe(true);
    }
  });
});
