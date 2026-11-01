import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/after-childbirth-context-reflection.json";
import content from "@/lib/questionnaires/result-content/after-childbirth-context-reflection.json";
import { afterChildbirthResultProfile } from "@/lib/questionnaires/result-content/after-childbirth-context-reflection";
import { isBirthContext16ConfigurationValid, recordBirthContext16 } from "@/lib/questionnaires/birthContext16";
import { BirthContextPage, BirthContextGuidePage } from "@/components/questionnaires/BirthContextPage";
import { BirthContextReport } from "@/components/questionnaires/BirthContextReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Four full bilingual birth-context public readings with private observations kept separate",()=>{
  it("preserves every source paragraph and the strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=afterChildbirthResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isBirthContext16ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(afterChildbirthResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all four %s full readings before answers without modifying raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<BirthContextPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-birth-context-result-reading]")).toHaveLength(4);expect(entry.querySelectorAll("[data-birth-context-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-birth-context-result-reading] h3')).toHaveLength(28);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-birth-context-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-birth-context-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-birth-context-count]')).toBeNull();expect(root.querySelector('[data-birth-context-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#birth-context-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isBirthContext16ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps literal categories and unchanged full %s public guides after every label",locale=>{
    for(const mode of [...categories,"mixed","one-unscored"]){const a=Object.fromEntries(Array.from({length:16},(_,i)=>[`BIRTH_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode==="one-unscored"?(i>=12?"na":"4"):mode])),before=recordBirthContext16(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<BirthContextReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-birth-context-theme]')).toHaveLength(4);expect(root.querySelectorAll('[data-birth-context-observation]')).toHaveLength(16);expect(root.querySelectorAll('[data-birth-context-count]')).toHaveLength(24);expect(root.querySelectorAll('[data-birth-context-unscored]')).toHaveLength(mode==="na"?4:mode==="one-unscored"?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<BirthContextGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordBirthContext16(quiz,a)).toEqual(before);expect(isBirthContext16ConfigurationValid(quiz)).toBe(true);
    }
  });
});
