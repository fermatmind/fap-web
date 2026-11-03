import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/number-series.json";
import { NumberSeriesPage } from "@/components/questionnaires/NumberSeriesPage";
import { numberSeriesSections, numberSeriesFaq, numberSeriesSummaries } from "@/components/questionnaires/NumberSeriesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("NumberSeries bounded practice methods and public reading", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<NumberSeriesPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...numberSeriesSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...numberSeriesFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="number-series-library"] li')).toHaveLength(5);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/number-series/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="number-series-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#number-series-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-practice-correct]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=number-series-reference-] a")).toHaveLength(3);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds explanations to five fixed practice topics without ability or norm claims", () => {
    expect(numberSeriesSections).toHaveLength(9); expect(numberSeriesFaq).toHaveLength(8);
    expect(Object.keys(numberSeriesSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of numberSeriesSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(data.questions).toHaveLength(30);
    expect(data.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6, 6]);
    const text = JSON.stringify(numberSeriesSections); expect(text).toContain("252"); expect(text).toContain("18 / 30"); expect(text).toContain("尚未建立信度");
  });
  it("keeps all newly authored worked examples arithmetically consistent", () => {
    expect([17,23,29,35,41].slice(1).map((n,i) => n - [17,23,29,35][i])) .toEqual([6,6,6,6]);
    expect([5,-10,20,-40,80].slice(1).map((n,i) => n / [5,-10,20,-40][i])).toEqual([-2,-2,-2,-2]);
    expect([2,6,13,23,36].slice(1).map((n,i) => n - [2,6,13,23][i])).toEqual([4,7,10,13]);
    const recurrence = [4,7]; for(let i=2;i<6;i++) recurrence.push(recurrence[i-1]+recurrence[i-2]+2);
    expect(recurrence).toEqual([4,7,13,22,37,61]);
    const linear = (n:number) => 3*n-1;
    const alternative = (n:number) => linear(n)+(n-1)*(n-2)*(n-3);
    expect([1,2,3].map(alternative)).toEqual([2,5,8]); expect(linear(4)).toBe(11); expect(alternative(4)).toBe(17);
  });
});
