import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/cognitive-functions-test.json";
import raw56 from "@/lib/questionnaires/jung56Content.json";
import bank from "@/lib/questionnaires/jung56Bank.json";
import additions32 from "@/lib/questionnaires/result-content/cognitive-functions-test.json";
import additions56 from "@/lib/questionnaires/result-content/jung56-readings.json";
import { cognitiveFunctionsResultProfile, prepareCognitiveFunctionsResultProfile } from "@/lib/questionnaires/result-content/cognitive-functions-test";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { getJung56ResultReading } from "@/lib/questionnaires/result-content/jung56-readings";
import { isJung56ContentValid, isJung56ConfigurationValid, type Jung56Content } from "@/lib/questionnaires/jung56";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCognitiveFunctionsReport } from "@/components/questionnaires/QuestionnaireCognitiveFunctionsReport";
import { Jung56GuideContent } from "@/components/questionnaires/Jung56GuideContent";
import Jung56EditionClient from "@/components/questionnaires/Jung56EditionClient";
import Original32Client from "@/components/questionnaires/CognitiveFunctions32Client";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=source as Questionnaire;
const prepared=prepareQuestionnaireResultReadings(quiz);
describe("Both complete cognitive-function result editions, with method-specific original extensions",()=>{
 it("prepares only the selected edition with the same full authoritative readings",()=>{
  expect(quiz.profiles.map(prepareCognitiveFunctionsResultProfile)).toEqual(prepared.profiles);
  expect(Original32Client({locale:"en"}).props.quiz.profiles).toEqual(prepared.profiles);
  for(const p of prepared.profiles) expect(prepareCognitiveFunctionsResultProfile(p)).toBe(p);
  const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareCognitiveFunctionsResultProfile(unknown)).toBe(unknown);
  expect(Jung56EditionClient({locale:"en"}).props.readings).toEqual(raw56.cards.map(c=>getJung56ResultReading(c.id)));
 });
 it("preserves raw bank, strict 56-card validation and every 32-rating source paragraph",()=>{
  const before=JSON.stringify([quiz,raw56,bank]);expect(isJung56ContentValid(raw56)).toBe(true);expect(isJung56ConfigurationValid(bank)).toBe(true);
  for(const p of quiz.profiles){const r=cognitiveFunctionsResultProfile(p);expect(r.sections.flatMap(s=>s.paragraphs)).toHaveLength(17);expect(r.title).toEqual(p.title);expect(r.sections.map(s=>s.id)).toEqual(p.sections.map(s=>s.id));for(const s of p.sections)expect(r.sections.find(v=>v.id===s.id)!.paragraphs.slice(0,2)).toEqual(s.paragraphs);}
  const unknown={...quiz.profiles[0],id:"__proto__"};expect(cognitiveFunctionsResultProfile(unknown)).toBe(unknown);expect(getJung56ResultReading("__proto__")).toBeUndefined();expect(JSON.stringify([quiz,raw56,bank])).toBe(before);
 });
 it.each(["zh","en"] as const)("renders all eight %s public identities with both method bodies and no personal counts",async locale=>{
  const route=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of quiz.profiles){const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(await route.default({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})}));expect(root.querySelectorAll('[data-cognitive-functions-result-reading] h3')).toHaveLength(7);expect(root.querySelectorAll('[data-jung56-reading] h3')).toHaveLength(10);expect(root.querySelector('[data-cognitive-mean], [data-jung56-count]')).toBeNull();for(const s of additions32[p.id as keyof typeof additions32])for(const t of s.paragraphs)expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(t[locale]);for(const s of additions56[p.id as keyof typeof additions56])for(const t of s.paragraphs)expect(root.querySelector(`#public-jung56-${p.id}-${s.id}`)?.textContent).toContain(t[locale]);const ids=[...root.querySelectorAll('[id]')].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);for(const a of root.querySelectorAll('nav a[href^="#"]'))expect(ids).toContain(a.getAttribute('href')!.slice(1));if(locale==='en')expect(root.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["zh","en"] as const)("retains every %s 32-rating guide beside reverse-key arithmetic and both sides of minimum three",locale=>{
  const patterns=[...["1","2","3","4","5","na"].map(v=>Array(32).fill(v)),Array.from({length:32},(_,i)=>["4","3","5","2"][i%4]),Array.from({length:32},(_,i)=>["4","na","5","2"][i%4]),Array.from({length:32},(_,i)=>["na","na","5","2"][i%4])];
  for(const values of patterns){const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,values[i]])),result=scoreLikertQuestionnaire(prepared,answers);expect(result).toEqual(scoreLikertQuestionnaire(quiz,answers));if(result.status!=='complete')throw Error('Complete witness required');const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<QuestionnaireCognitiveFunctionsReport quiz={prepared} result={result} answers={answers} locale={locale}/>);expect(root.querySelectorAll('[data-cognitive-functions-result-reading] h4')).toHaveLength(56);expect(root.querySelectorAll('[data-cognitive-answer]')).toHaveLength(32);for(const p of quiz.profiles){const f=result.facets[p.id];expect(root.querySelector(`[data-cognitive-mean="${p.id}"]`)?.textContent).toBe(f.mean===null?(locale==='zh'?'不计算':'Not calculated'):`${f.mean.toFixed(1)} / 5`);for(const s of additions32[p.id as keyof typeof additions32])for(const t of s.paragraphs)expect(root.querySelector(`[data-cognitive-functions-result-reading="${p.id}"]`)?.textContent).toContain(t[locale]);}}
  const element=Original32Client({locale,readingProfiles:prepared.profiles});expect(element.props.quiz.profiles).toEqual(prepared.profiles);const foreign=prepared.profiles.map(p=>({...p,resultReading:{...p.resultReading!,quizSlug:'other'}}));expect(Original32Client({locale,readingProfiles:foreign}).props.quiz.profiles).toEqual(quiz.profiles);
 });
 it.each(["zh","en"] as const)("keeps all ten %s 56-choice modules, adds bounded discussion and rejects foreign extensions",locale=>{
  for(const card of (raw56 as Jung56Content).cards){const reading=getJung56ResultReading(card.id)!,root=document.createElement('div');root.innerHTML=renderToStaticMarkup(<Jung56GuideContent card={card} reading={reading} locale={locale}/>);expect(root.querySelectorAll('h4')).toHaveLength(10);expect(root.querySelector('[data-jung56-reading]')?.getAttribute('data-jung56-reading')).toBe(card.id);for(const s of reading.sections)for(const t of s.paragraphs)expect(root.textContent).toContain(t[locale]);for(const key of ['construct_definition','attention_focus','processing_pattern','interpretation_boundary'] as const)expect(root.textContent).toContain(card[key][locale]);for(const key of ['observable_tendencies','possible_contributions','possible_blind_spots','balance_practices','reflection_questions','does_not_mean'] as const)for(const t of card[key])expect(root.textContent).toContain(t[locale]);
   for(const foreign of [{...reading,profileId:card.id==='se'?'si':'se'} as typeof reading,{...reading,edition:'other'} as unknown as typeof reading]){const fallback=renderToStaticMarkup(<Jung56GuideContent card={card} reading={foreign} locale={locale}/>);expect(fallback).not.toContain('data-jung56-reading=');expect(fallback).not.toContain(reading.sections[0].paragraphs[0][locale]);}
  }
 });
});
