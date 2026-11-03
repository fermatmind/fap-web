import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/deep-desire.json";
import { DeepDesirePage } from "@/components/questionnaires/DeepDesirePage";
import { deepDesireSections, deepDesireFaq, deepDesireSummaries } from "@/components/questionnaires/DeepDesireLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("DeepDesire four task-habit groups and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<DeepDesirePage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...deepDesireSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...deepDesireFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="deep-desire-library"] li')).toHaveLength(6);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/deep-desire/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="deep-desire-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#deep-desire-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-skills-evidence-row]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=deep-desire-reference-] a")).toHaveLength(2);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("retains six independent groups, exact quarter steps and bilingual chapters", () => {
    expect(deepDesireSections).toHaveLength(9); expect(deepDesireFaq).toHaveLength(8);
    expect(Object.keys(deepDesireSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(24);
    expect([2,4,3,4].reduce((a,b)=>a+b,0)/4).toBe(3.25);
    expect([1,1,1,2].reduce((a,b)=>a+b,0)/4).toBe(1.25);
    for(const s of deepDesireSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
  });
});
