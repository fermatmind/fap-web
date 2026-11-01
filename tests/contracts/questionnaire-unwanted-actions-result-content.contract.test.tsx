import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/unwanted-thoughts-actions-reflection.json";
import content from "@/lib/questionnaires/result-content/unwanted-thoughts-actions-reflection.json";
import { unwantedActionsResultProfile } from "@/lib/questionnaires/result-content/unwanted-thoughts-actions-reflection";
import { isUnwantedActions20ConfigurationValid, recordUnwantedActions20 } from "@/lib/questionnaires/unwantedActions20";
import { UnwantedActionsPage, UnwantedActionsGuidePage } from "@/components/questionnaires/UnwantedActionsPage";
import { UnwantedActionsReport } from "@/components/questionnaires/UnwantedActionsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Five full bilingual thoughts-and-actions public readings with private observations kept separate",()=>{
  it("preserves every source paragraph and the strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=unwantedActionsResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isUnwantedActions20ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(unwantedActionsResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all five %s full readings before answers without modifying raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<UnwantedActionsPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-unwanted-actions-result-reading]")).toHaveLength(5);expect(entry.querySelectorAll("[data-unwanted-actions-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-unwanted-actions-result-reading] h3')).toHaveLength(35);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-unwanted-actions-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-unwanted-actions-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-unwanted-actions-count]')).toBeNull();expect(root.querySelector('[data-unwanted-actions-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#unwanted-actions-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isUnwantedActions20ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps literal categories and unchanged full %s public guides after every label",locale=>{
    for(const mode of [...categories,"mixed","one-unscored"]){const a=Object.fromEntries(Array.from({length:20},(_,i)=>[`URA_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode==="one-unscored"?(i>=16?"na":"4"):mode])),before=recordUnwantedActions20(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<UnwantedActionsReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-unwanted-actions-theme]')).toHaveLength(5);expect(root.querySelectorAll('[data-unwanted-actions-observation]')).toHaveLength(20);expect(root.querySelectorAll('[data-unwanted-actions-count]')).toHaveLength(30);expect(root.querySelectorAll('[data-unwanted-actions-unscored]')).toHaveLength(mode==="na"?5:mode==="one-unscored"?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<UnwantedActionsGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordUnwantedActions20(quiz,a)).toEqual(before);expect(isUnwantedActions20ConfigurationValid(quiz)).toBe(true);
    }
  });
});
