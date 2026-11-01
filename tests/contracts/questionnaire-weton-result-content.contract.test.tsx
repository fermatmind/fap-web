import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/weton-story-preferences.json";
import content from "@/lib/questionnaires/result-content/weton-story-preferences.json";
import witnesses from "@/tests/fixtures/questionnaires/weton-story35-tie-witnesses.json";
import { wetonStoryResultProfile } from "@/lib/questionnaires/result-content/weton-story-preferences";
import { prepareResultProfile, prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isWetonStory35ConfigurationValid, scoreWetonStory35, calculateWetonCalendar } from "@/lib/questionnaires/wetonStory35";
import { WetonStory35Report } from "@/components/questionnaires/WetonStory35Report";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const dom=(html:string)=>{const root=document.createElement("div");root.innerHTML=html;return root;};
describe("35 bilingual original Weton story guides with calendar and preferences separate",()=>{
  it("preserves the raw source, every paragraph, identity and both choice banks",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());expect(isWetonStory35ConfigurationValid(prepared)).toBe(true);
    for(const p of quiz.profiles){const r=wetonStoryResultProfile(p);expect(r.title).toEqual(p.title);expect(r.headline).toEqual(p.headline);expect(r.summary).toEqual(p.summary);expect(r.seo).toEqual(p.seo);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);const v=prepareResultProfile(quiz.slug,p);expect(prepareResultProfile(quiz.slug,v)).toBe(v);}
    expect(JSON.stringify(quiz)).toBe(before);expect(isWetonStory35ConfigurationValid(quiz)).toBe(true);expect(prepared.questions).toBe(quiz.questions);expect(prepared.source).toBe(quiz.source);expect(prepared.directions).toBe(quiz.directions);const unknown={...quiz.profiles[0],id:"__proto__"};expect(wetonStoryResultProfile(unknown)).toBe(unknown);expect(new Set(Object.values(content).map(s=>s[0].paragraphs[0].en)).size).toBe(35);expect(new Set(Object.values(content).map(s=>s[1].paragraphs[0].en)).size).toBe(35);
  });
  it.each(["zh","en"] as const)("opens every full %s public story without personal counts or calendar values",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const root=dom(renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));expect(root.querySelector(`[data-weton-story-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-weton-story-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-weton-count],[data-weton-calendar-result],input')).toBeNull();for(const s of prepareResultProfile(quiz.slug,p).sections)for(const text of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh","en"] as const)("retains 28 matched %s guides and withholds both banks for any unscored response",locale=>{
    const prepared=prepareQuestionnaireResultReadings(quiz),values=[...witnesses.banks[0].states.find(s=>s.leaders.length===7)!.choices,...witnesses.banks[1].states.find(s=>s.leaders.length===4)!.choices];
    for(const mode of ["scored","one-na","all-na"]){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,mode==="all-na"||mode==="one-na"&&i===34?"na":values[i]])),before=scoreWetonStory35(quiz,answers),result=scoreWetonStory35(prepared,answers);expect(result).toEqual(before);if(result.status!=="complete")throw Error("Fixture failed");const root=dom(renderToStaticMarkup(<WetonStory35Report quiz={prepared} result={result} locale={locale}/>));expect(root.querySelectorAll('[data-weton-profile]')).toHaveLength(mode==="scored"?28:0);expect(root.querySelectorAll('[data-weton-count]')).toHaveLength(mode==="scored"?12:0);expect(root.querySelectorAll('[data-weton-profile] h4')).toHaveLength(mode==="scored"?224:0);expect(root.querySelectorAll('#weton-all-guides + ul a')).toHaveLength(35);
      for(const p of prepared.profiles.filter(p=>result.profileIds.includes(p.id)))for(const s of p.sections)for(const text of s.paragraphs)expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));
      const dates=["1945-08-17","2026-05-01"];for(const d of dates)for(const relation of ["before","after","unknown"]){expect(calculateWetonCalendar(d,relation).status).toBe("complete");expect(scoreWetonStory35(prepared,answers)).toEqual(before);}
    }
  });
});
