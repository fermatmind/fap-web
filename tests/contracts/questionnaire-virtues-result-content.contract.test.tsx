import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import content from "@/lib/questionnaires/result-content/seven-sins-virtues-test.json";
import { virtuesResultProfile } from "@/lib/questionnaires/result-content/seven-sins-virtues-test";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isMiniVirtuesConfigurationValid, scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { QuestionnaireMiniVirtuesReport } from "@/components/questionnaires/QuestionnaireMiniVirtuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire,prepared=prepareQuestionnaireResultReadings(quiz);
describe("Seven public guides with independently scored pairs",()=>{
 it("preserves all source paragraphs and adds three per reading without changing admission",()=>{
  const before=JSON.stringify(quiz);expect(Object.keys(content)).toEqual(quiz.profiles.map(p=>p.id));for(const p of quiz.profiles){const r=virtuesResultProfile(p);expect({...r,sections:p.sections}).toEqual(p);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(20);for(const s of p.sections)expect(r.sections.find(t=>t.id===s.id)!.paragraphs.slice(0,s.paragraphs.length)).toEqual(s.paragraphs);}expect(JSON.stringify(quiz)).toBe(before);expect(isMiniVirtuesConfigurationValid(prepared)).toBe(true);expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);const unknown={...quiz.profiles[0],id:'__proto__'};expect(virtuesResultProfile(unknown)).toBe(unknown);const a=Object.fromEntries(quiz.questions.map(q=>[q.id,'3']));for(const q of quiz.questions){const partial={...a};delete partial[q.id];expect(scoreMiniVirtuesQuestionnaire(prepared,partial)).toEqual({status:'incomplete',answered:27});}
 });
 it.each(["zh","en"]as const)("opens all seven public %s readings without personal sums or means",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");for(const p of quiz.profiles){const dom=document.createElement('div');dom.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(dom.querySelector(`[data-virtues-result-reading="${p.id}"]`)).not.toBeNull();expect(dom.querySelectorAll('[data-virtues-result-reading] h2')).toHaveLength(8);expect(dom.querySelector('[data-mini-virtues-score]')).toBeNull();for(const section of virtuesResultProfile(p).sections)for(const t of section.paragraphs)expect(dom.querySelector(`#report-${section.id}`)?.textContent).toContain(t[locale]);const ids=[...dom.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of dom.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==='en')expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh", "en"] as const)("renders all seven paired scores and full %s guides", locale => {
  const answers = Object.fromEntries(quiz.questions.map((question, i) => [question.id, i % 2 === 0 ? "1" : "5"]));
  const result = scoreMiniVirtuesQuestionnaire(prepared, answers);
  expect(result).toEqual(scoreMiniVirtuesQuestionnaire(quiz, answers));
  if (result.status !== "complete" || result.model !== "dual") throw Error("Dual-track result required");
  const dom = document.createElement("div");
  dom.innerHTML = renderToStaticMarkup(<QuestionnaireMiniVirtuesReport quiz={prepared} result={result} locale={locale} />);
  expect(dom.querySelectorAll("[data-mini-virtues-everyday]")).toHaveLength(7);
  expect(dom.querySelectorAll("[data-mini-virtues-action]")).toHaveLength(7);
  for (const part of result.miniVirtues) {
   expect(part).toMatchObject({ sin: 0, virtue: 100 });
   const score = dom.querySelector(`[data-mini-virtues-score="${part.id}"]`)!;
   expect([...score.querySelectorAll("strong")].map(node => node.textContent)).toEqual(["0", "100"]);
  }
  for (const profile of quiz.profiles) for (const section of virtuesResultProfile(profile).sections) for (const paragraph of section.paragraphs) {
   const selector = section.id === "edition" || paragraph[locale] === profile.scoreReading[locale]
    ? "[data-mini-virtues-common]" : `[data-virtues-result-reading="${profile.id}"]`;
   expect(dom.querySelector(selector)?.textContent).toContain(paragraph[locale]);
  }
  const ids = [...dom.querySelectorAll("[id]")].map(node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
 });
});
