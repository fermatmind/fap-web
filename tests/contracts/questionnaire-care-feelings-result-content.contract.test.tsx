import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/care-feelings-reflection.json";
import content from "@/lib/questionnaires/result-content/care-feelings-reflection.json";
import { careFeelingsResultProfile } from "@/lib/questionnaires/result-content/care-feelings-reflection";
import { isCareFeelings20ConfigurationValid, recordCareFeelings20 } from "@/lib/questionnaires/careFeelings20";
import { CareFeelingsPage, CareFeelingsGuidePage } from "@/components/questionnaires/CareFeelingsPage";
import { CareFeelingsReport } from "@/components/questionnaires/CareFeelingsReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Four full bilingual public readings with source records kept separate",()=>{
  it("preserves every source paragraph and strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=careFeelingsResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(15);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isCareFeelings20ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(careFeelingsResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all four %s full readings before answers without changing raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<CareFeelingsPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-care-feelings-result-reading]")).toHaveLength(4);expect(entry.querySelectorAll("[data-care-feelings-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-care-feelings-result-reading] h3')).toHaveLength(24);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-care-feelings-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-care-feelings-result-reading] h2')).toHaveLength(6);expect(root.querySelector('[data-care-feelings-count]')).toBeNull();expect(root.querySelector('[data-care-feelings-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#care-feelings-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll("nav a"))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isCareFeelings20ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps counts, unscored state and all public %s paragraphs available after every label",locale=>{
    for(const mode of [...categories,"mixed"]){const a=Object.fromEntries(Array.from({length:20},(_,i)=>[`CFN_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode])),before=recordCareFeelings20(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<CareFeelingsReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-care-feelings-theme]')).toHaveLength(4);expect(root.querySelectorAll('[data-care-feelings-observation]')).toHaveLength(20);expect(root.querySelectorAll('[data-care-feelings-count]')).toHaveLength(24);expect(root.querySelectorAll('[data-care-feelings-unscored]')).toHaveLength(mode==="na"?4:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<CareFeelingsGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordCareFeelings20(quiz,a)).toEqual(before);expect(isCareFeelings20ConfigurationValid(quiz)).toBe(true);
    }
  });
});
