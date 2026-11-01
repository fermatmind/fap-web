import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/connection-belonging-check-in.json";
import content from "@/lib/questionnaires/result-content/connection-belonging-check-in.json";
import { connectionBelongingResultProfile } from "@/lib/questionnaires/result-content/connection-belonging-check-in";
import { isConnectionCheckIn21ConfigurationValid, recordConnectionCheckIn21 } from "@/lib/questionnaires/connectionCheckIn21";
import { ConnectionCheckInPage, ConnectionCheckInGuidePage } from "@/components/questionnaires/ConnectionCheckInPage";
import { ConnectionCheckInReport } from "@/components/questionnaires/ConnectionCheckInReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const categories=["0","1","2","3","4","na"];
describe("Three full bilingual connection-checkin public readings with private observations kept separate",()=>{
  it("preserves every source paragraph and the strict recording contract",()=>{
    const before=JSON.stringify(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());for(const p of quiz.profiles){const r=connectionBelongingResultProfile(p);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isConnectionCheckIn21ConfigurationValid(quiz)).toBe(true);const unknown={...quiz.profiles[0],id:"__proto__"};expect(connectionBelongingResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh","en"] as const)("opens all three %s full readings before answers without modifying raw configuration",async locale=>{
    const before=JSON.stringify(quiz),entry=document.createElement("div");entry.innerHTML=renderToStaticMarkup(<ConnectionCheckInPage quiz={quiz} locale={locale}/>);expect(entry.querySelectorAll("[data-connection-belonging-result-reading]")).toHaveLength(3);expect(entry.querySelectorAll("[data-connection-checkin-theme]")).toHaveLength(0);expect(entry.querySelectorAll('[data-connection-belonging-result-reading] h3')).toHaveLength(21);
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-connection-belonging-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-connection-belonging-result-reading] h2')).toHaveLength(7);expect(root.querySelector('[data-connection-checkin-count]')).toBeNull();expect(root.querySelector('[data-connection-checkin-support]')?.closest('details')).toBeNull();
      for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs){expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);expect(entry.querySelector(`#connection-checkin-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);}
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isConnectionCheckIn21ConfigurationValid(quiz)).toBe(true);
  });
  it.each(["zh","en"] as const)("keeps literal categories and unchanged full %s public guides after every label",locale=>{
    for(const mode of [...categories,"mixed","one-unscored"]){const a=Object.fromEntries(Array.from({length:21},(_,i)=>[`CON_${String(i+1).padStart(2,"0")}`,mode==="mixed"?categories[i%6]:mode==="one-unscored"?(i>=14?"na":"4"):mode])),before=recordConnectionCheckIn21(quiz,a);if(before.status!=="complete")throw Error("Complete record required");const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(<ConnectionCheckInReport quiz={quiz} records={before.records} locale={locale}/>);expect(root.querySelectorAll('[data-connection-checkin-theme]')).toHaveLength(3);expect(root.querySelectorAll('[data-connection-checkin-observation]')).toHaveLength(21);expect(root.querySelectorAll('[data-connection-checkin-count]')).toHaveLength(18);expect(root.querySelectorAll('[data-connection-checkin-unscored]')).toHaveLength(mode==="na"?3:mode==="one-unscored"?1:0);
      for(const p of quiz.profiles){const guide=document.createElement("div");guide.innerHTML=renderToStaticMarkup(<ConnectionCheckInGuidePage quiz={quiz} profile={p} locale={locale}/>);for(const s of content[p.id as keyof typeof content])for(const text of s.paragraphs)expect(guide.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);}
      expect(recordConnectionCheckIn21(quiz,a)).toEqual(before);expect(isConnectionCheckIn21ConfigurationValid(quiz)).toBe(true);
    }
  });
});
