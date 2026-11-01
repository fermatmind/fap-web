import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/nakshatra-spica-reference.json";
import content from "@/lib/questionnaires/result-content/nakshatra-spica-reference.json";
import { nakshatraSpicaResultProfile } from "@/lib/questionnaires/result-content/nakshatra-spica-reference";
import { prepareResultProfile, prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isNakshatra27ConfigurationValid, classifyNakshatraLongitude } from "@/lib/questionnaires/nakshatra27";
import { calculateNakshatra } from "@/lib/questionnaires/nakshatra27Calculation";
import { Nakshatra27Report } from "@/components/questionnaires/Nakshatra27Report";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const dom=(html:string)=>{const root=document.createElement("div");root.innerHTML=html;return root;};
describe("27 bilingual Spica-reference cultural readings without changing positions",()=>{
  it("preserves identities, raw data and eight modules, with a source-specific paired-figure translation correction",()=>{
    const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p=>p.id).sort());expect(isNakshatra27ConfigurationValid(prepared)).toBe(true);
    for(const p of quiz.profiles){const r=nakshatraSpicaResultProfile(p);expect(r.id).toBe(p.id);expect(r.title).toEqual(p.title);expect(r.directionIds).toEqual(p.directionIds);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);
      if(p.id!=="uttara-bhadrapada")for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);
      else {expect(r.headline.en).toContain("human pair");expect(r.seo?.description).toEqual(r.summary);expect(r.sections[0].paragraphs[0].en).toContain("human pair (yamala-purusha)");expect(r.sections[1].paragraphs[0].en).not.toContain("Two faces in a traditional figure");expect(r.sections[0].paragraphs[0].zh).toContain("成对人形");}
      const v=prepareResultProfile(quiz.slug,p);expect(prepareResultProfile(quiz.slug,v)).toBe(v);
    }
    expect(JSON.stringify(quiz)).toBe(before);expect(isNakshatra27ConfigurationValid(quiz)).toBe(true);expect(prepared.questions).toBe(quiz.questions);expect(prepared.source).toBe(quiz.source);const unknown={...quiz.profiles[0],id:"__proto__"};expect(nakshatraSpicaResultProfile(unknown)).toBe(unknown);
    expect(new Set(Object.values(content).map(s=>s[0].paragraphs[0].en)).size).toBe(27);expect(new Set(Object.values(content).map(s=>s[1].paragraphs[0].en)).size).toBe(27);
  });
  it.each(["zh","en"] as const)("opens all 27 full %s public readings and corrected summary with no private position",async locale=>{
    const route=await import("@/components/questionnaires/QuestionnaireGuide");
    for(const p of quiz.profiles){const props={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})};const root=dom(renderToStaticMarkup(await route.default(props)));expect(root.querySelector(`[data-nakshatra-spica-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-nakshatra-spica-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-nakshatra-report],input')).toBeNull();
      for(const s of prepareResultProfile(quiz.slug,p).sections)for(const text of s.paragraphs)expect(root.querySelector(`#nakshatra-public-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
      if(p.id==="uttara-bhadrapada")expect((await route.generateMetadata(props)).description).toBe(prepareResultProfile(quiz.slug,p).summary[locale]);
    }
  });
  it.each(["zh","en"] as const)("renders every single and adjacent %s result with distinct module anchors and unchanged coordinates",locale=>{
    const input={date:"2000-01-01",time:"12:00",zone:"UTC",knownTime:true,placeConfirmed:true},before=calculateNakshatra(input,Date.parse("2026-10-30T00:00Z"));if(before.status!=="complete")throw Error("Fixture failed");const prepared=prepareQuestionnaireResultReadings(quiz);
    for(let i=0;i<27;i++)for(const edge of [false,true]){const sector=classifyNakshatraLongitude((i+(edge?0:0.5))*(360/27))!,root=dom(renderToStaticMarkup(<Nakshatra27Report quiz={prepared} reading={{...before.reading,...sector}} locale={locale}/>));expect(root.querySelectorAll('[data-nakshatra-profile]')).toHaveLength(edge?2:1);expect(root.querySelectorAll('[data-nakshatra-spica-result-reading]')).toHaveLength(edge?2:1);expect(root.querySelectorAll('[data-nakshatra-profile] h4')).toHaveLength(edge?16:8);
      for(const p of prepared.profiles.filter(p=>sector.profileIds.includes(p.id as typeof sector.id)))for(const s of p.sections)for(const text of s.paragraphs)expect(root.querySelector(`#nakshatra-result-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      const ids=[...root.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
    expect(calculateNakshatra(input,Date.parse("2026-10-30T00:00Z"))).toEqual(before);
  });
});
