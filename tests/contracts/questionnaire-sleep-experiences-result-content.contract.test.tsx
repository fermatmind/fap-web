import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/sleep-experiences-reflection.json";
import content from "@/lib/questionnaires/result-content/sleep-experiences-reflection.json";
import { sleepExperiencesResultProfile } from "@/lib/questionnaires/result-content/sleep-experiences-reflection";
import { isSleepExperiences20ConfigurationValid, recordSleepExperiences20 } from "@/lib/questionnaires/sleepExperiences20";
import { SleepExperiencesPage, SleepExperiencesGuidePage } from "@/components/questionnaires/SleepExperiencesPage";
import { SleepExperiencesReport } from "@/components/questionnaires/SleepExperiencesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Five full bilingual sleep-experiences public readings with private observations kept separate",()=>{
  it("preserves every source paragraph and the strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=sleepExperiencesResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isSleepExperiences20ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(sleepExperiencesResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all five %s full readings before answers without modifying raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<SleepExperiencesPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-sleep-experiences-result-reading]")).toHaveLength(5);expect(entry.querySelectorAll("[data-sleep-experiences-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-sleep-experiences-result-reading] h3')).toHaveLength(35);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-sleep-experiences-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-sleep-experiences-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-sleep-experiences-count]')).toBeNull();expect(root.querySelector('[data-sleep-experiences-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#sleep-experiences-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isSleepExperiences20ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps literal categories and unchanged full %s public guides after every label",locale=>{
    for(const mode of [...categories,"mixed","one-unscored"]){const a=Object.fromEntries(Array.from({length:20},(_,i)=>[`SLP_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode==="one-unscored"?(i>=16?"na":"4"):mode])),before=recordSleepExperiences20(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<SleepExperiencesReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-sleep-experiences-theme]')).toHaveLength(5);expect(root.querySelectorAll('[data-sleep-experiences-observation]')).toHaveLength(20);expect(root.querySelectorAll('[data-sleep-experiences-count]')).toHaveLength(30);expect(root.querySelectorAll('[data-sleep-experiences-unscored]')).toHaveLength(mode==="na"?5:mode==="one-unscored"?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<SleepExperiencesGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordSleepExperiences20(quiz,a)).toEqual(before);expect(isSleepExperiences20ConfigurationValid(quiz)).toBe(true);
    }
  });
});
