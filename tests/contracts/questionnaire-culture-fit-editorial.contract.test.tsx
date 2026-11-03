import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/culture-fit.json";
import { CultureFitPage } from "@/components/questionnaires/CultureFitPage";
import { cultureFitSections, cultureFitFaq, cultureFitSummaries } from "@/components/questionnaires/CultureFitLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("CultureFit four task-habit groups and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<CultureFitPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...cultureFitSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...cultureFitFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="culture-fit-library"] li')).toHaveLength(4);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/culture-fit/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="culture-fit-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#culture-fit-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-work-arrangement-score]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=culture-fit-reference-] a")).toHaveLength(2);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds four separate habit groups and reproducible arithmetic without a grade", () => {
    expect(cultureFitSections).toHaveLength(9); expect(cultureFitFaq).toHaveLength(8);
    expect(Object.keys(cultureFitSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of cultureFitSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(data.questions).toHaveLength(24);
    const raw = [4,2,3,2,5,3], keyed = raw.map((v,i) => i % 2 === 1 ? 6-v : v);
    expect(keyed).toEqual([4,4,3,4,5,3]); expect(keyed.reduce((a,b)=>a+b,0)).toBe(23);
    expect(Math.round(23/6*10)/10).toBe(3.8);
    expect([3,3,3,3,3,3].reduce((a,b)=>a+b,0)/6).toBe(3); expect([1,5,1,5,1,5].reduce((a,b)=>a+b,0)/6).toBe(3);
  });
});
