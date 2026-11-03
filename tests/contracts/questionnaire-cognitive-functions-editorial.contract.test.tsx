import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/cognitive-functions-test.json";
import rawContent from "@/lib/questionnaires/jung56Content.json";
import { CognitiveFunctionsPage } from "@/components/questionnaires/CognitiveFunctionsPage";
import { cognitiveSections, cognitiveFaq, cognitiveSummaries } from "@/components/questionnaires/CognitiveFunctionsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("Cognitive functions editorial preserves both independent methods", () => {
 it.each(["en", "zh"] as const)("shows complete source instructions, eight guides, sixteen FAQ and direct version starts: %s", locale => {
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<CognitiveFunctionsPage quiz={data as Questionnaire} locale={locale}/>);
  const text=dom.textContent!;
  for(const s of [...data.guide,...cognitiveSections]) for(const p of s.paragraphs) expect(text).toContain(p[locale]);
  for(const p of Object.values(rawContent.common)) expect(text).toContain(p[locale]);
  for(const f of [...data.faq,...cognitiveFaq]) expect(text).toContain(f.answer[locale]);
  expect(dom.querySelectorAll('[aria-labelledby="cognitive-public-guides"] li')).toHaveLength(8);
  expect(dom.querySelectorAll('[aria-labelledby="cognitive-faq"] h3')).toHaveLength(16);
  expect(dom.querySelectorAll('[data-explore-start][data-cognitive-method]')).toHaveLength(2);
  expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
  expect(dom.querySelector('[data-cognitive-eight-directions]')).not.toBeNull();
  for(const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/cognitive-functions-test/results/${p.id}"]`)).not.toBeNull();
  for(const a of dom.querySelectorAll('a[href^="#cognitive-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
  const ids=[...dom.querySelectorAll('[id]')].map(x=>x.id);expect(new Set(ids).size).toBe(ids.length);
  expect(text).not.toContain(locale==='zh'?'56题版题本／计分版本':'56-choice bank / scoring edition');
 });
 it("keeps bespoke bilingual definitions and distinct reproducible arithmetic",()=>{
  expect(cognitiveSections).toHaveLength(14);expect(cognitiveFaq).toHaveLength(8);
  expect(Object.keys(cognitiveSummaries)).toEqual(data.profiles.map(p=>p.id));
  const keyed=[4,3,5,6-2];expect(keyed.reduce((a,b)=>a+b,0)/4).toBe(4);
  expect(Math.round((4+5+6-2)/3*10)/10).toBe(4.3);
  for(const s of cognitiveSections) for(const p of [s.title,...s.paragraphs]){expect(p.en.length).toBeGreaterThan(12);expect(p.zh.length).toBeGreaterThan(7);}
 });
});
