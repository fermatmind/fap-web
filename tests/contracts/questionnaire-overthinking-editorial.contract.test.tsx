import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/overthinking-screener.json";
import { PtqPage } from "@/components/questionnaires/PtqPage";
import { ptqSections, ptqFaq, ptqSummaries } from "@/components/questionnaires/PtqLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Ptq three related thinking processes and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<PtqPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...ptqSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...ptqFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="overthinking-screener-library"] li')).toHaveLength(4);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/overthinking-screener/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="overthinking-screener-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#overthinking-screener-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-skills-evidence-row]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=overthinking-screener-reference-] a")).toHaveLength(4);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("keeps original non-reversed values and reproduces interleaved sums", () => {
    expect(ptqSections).toHaveLength(9); expect(ptqFaq).toHaveLength(8);
    expect(Object.keys(ptqSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(15);
    for(const q of (data as Questionnaire).questions) { expect(q.reverse).toBeUndefined(); for(const o of q.options) expect(o.score === null || typeof o.score === "number").toBe(true); }
    const groups = [[1,2,3,6,7,8,11,12,13],[4,9,14],[5,10,15]];
    const raw = [2,1,3,2,1,2,3,1,2,1,3,2,1,2,3];
    expect(groups.map(g=>g.reduce((n,i)=>n+raw[i-1],0))).toEqual([18,6,5]);
    for(const s of ptqSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
  });
});
