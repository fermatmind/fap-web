import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/style-impression-preferences.json";
import content from "@/lib/questionnaires/result-content/style-impression-preferences.json";
import witnesses from "../fixtures/questionnaires/style-impression-preferences-witnesses.json";
import { styleImpressionResultProfile } from "@/lib/questionnaires/result-content/style-impression-preferences";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { scoreArchetypeQuestionnaire, isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import { StyleImpressionReport } from "@/components/questionnaires/StyleImpressionReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
describe("Eight bilingual style-impression readings with all highest ties retained",()=>{
 it("preserves identities, palettes, every original paragraph and scoring across all219witnesses",()=>{
  const before=JSON.stringify(quiz),prepared=prepareQuestionnaireResultReadings(quiz);
  expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));expect(isArchetypeConfigurationValid(prepared)).toBe(true);
  for(const p of quiz.profiles){const r=styleImpressionResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(11);expect(r.paletteSwatches).toEqual(p.paletteSwatches);expect(r.title).toEqual(p.title);expect(r.scoreReading).toEqual(p.scoreReading);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs[0]).toEqual(s.paragraphs[0]);}
  for(const w of witnesses.witnesses){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,w.answers[i]]));expect(scoreArchetypeQuestionnaire(prepared,answers)).toEqual(scoreArchetypeQuestionnaire(quiz,answers));}
  const unknown={...quiz.profiles[0],id:"__proto__"};expect(styleImpressionResultProfile(unknown)).toBe(unknown);expect(JSON.stringify(quiz)).toBe(before);
 });
 it.each(["zh","en"] as const)("opens each full %s public reading without private counts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of quiz.profiles){const root=document.createElement("div");root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelector(`[data-style-impression-result-reading="${p.id}"]`)).not.toBeNull();expect(root.querySelectorAll('[data-style-impression-result-reading] h2')).toHaveLength(8);expect(root.querySelector('[data-sip-count]')).toBeNull();for(const s of content[p.id as keyof typeof content])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==="en")expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("renders all %s additions for every feasible highest set including all8tie64modules",locale=>{
  const prepared=prepareQuestionnaireResultReadings(quiz);
  for(const w of witnesses.witnesses){const result=scoreArchetypeQuestionnaire(prepared,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,w.answers[i]])));if(result.status!=="complete")throw Error('Witness required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<StyleImpressionReport quiz={prepared} result={result} locale={locale}/>);expect(root.querySelectorAll('[data-style-impression-result-reading]')).toHaveLength(w.leaders.length);expect(root.querySelectorAll('[data-sip-profile] h4')).toHaveLength(w.leaders.length*8);for(const id of w.leaders){const reading=root.querySelector(`[data-style-impression-result-reading="${id}"]`)!;for(const s of content[id as keyof typeof content])for(const t of s.paragraphs)expect(reading.textContent).toContain(t[locale]);}for(const d of quiz.directions)expect(root.querySelector(`[data-sip-theme="${d.id}"] [data-sip-count]`)?.textContent).toBe(`${w.counts[d.id as keyof typeof w.counts]} / 8`);}
 },30000);
});
