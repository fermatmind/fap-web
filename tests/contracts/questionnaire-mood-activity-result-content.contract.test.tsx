import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/mood-activity-changes-reflection.json";
import content from "@/lib/questionnaires/result-content/mood-activity-changes-reflection.json";
import { moodActivityResultProfile } from "@/lib/questionnaires/result-content/mood-activity-changes-reflection";
import { isMoodActivity16ConfigurationValid, recordMoodActivity16 } from "@/lib/questionnaires/moodActivity16";
import { MoodActivityPage, MoodActivityGuidePage } from "@/components/questionnaires/MoodActivityPage";
import { MoodActivityReport } from "@/components/questionnaires/MoodActivityReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Four full bilingual mood-activity public readings with private observations kept separate",()=>{
  it("preserves every source paragraph and the strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=moodActivityResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isMoodActivity16ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(moodActivityResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all four %s full readings before answers without modifying raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<MoodActivityPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-mood-activity-result-reading]")).toHaveLength(4);expect(entry.querySelectorAll("[data-mood-activity-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-mood-activity-result-reading] h3')).toHaveLength(28);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-mood-activity-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-mood-activity-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-mood-activity-count]')).toBeNull();expect(root.querySelector('[data-mood-activity-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#mood-activity-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isMoodActivity16ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps literal categories and unchanged full %s public guides after every label",locale=>{
    for(const mode of [...categories,"mixed","one-unscored"]){const a=Object.fromEntries(Array.from({length:16},(_,i)=>[`MAC_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode==="one-unscored"?(i>=12?"na":"4"):mode])),before=recordMoodActivity16(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<MoodActivityReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-mood-activity-theme]')).toHaveLength(4);expect(root.querySelectorAll('[data-mood-activity-observation]')).toHaveLength(16);expect(root.querySelectorAll('[data-mood-activity-count]')).toHaveLength(24);expect(root.querySelectorAll('[data-mood-activity-unscored]')).toHaveLength(mode==="na"?4:mode==="one-unscored"?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<MoodActivityGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordMoodActivity16(quiz,a)).toEqual(before);expect(isMoodActivity16ConfigurationValid(quiz)).toBe(true);
    }
  });
});
