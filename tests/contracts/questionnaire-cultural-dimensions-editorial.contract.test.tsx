import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/cultural-dimensions.json";
import { CulturalDimensionsPage } from "@/components/questionnaires/CulturalDimensionsPage";
import { culturalSections, culturalFaq, culturalSummaries } from "@/components/questionnaires/CulturalDimensionsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("CulturalDimensions four task-habit groups and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<CulturalDimensionsPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...culturalSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...culturalFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="cultural-dimensions-library"] li')).toHaveLength(6);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/cultural-dimensions/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="cultural-dimensions-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#cultural-dimensions-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-skills-evidence-row]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=cultural-dimensions-reference-] a")).toHaveLength(3);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("retains six independent groups, exact quarter steps and bilingual chapters", () => {
    expect(culturalSections).toHaveLength(11); expect(culturalFaq).toHaveLength(10);
    expect(Object.keys(culturalSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(36);
    expect(Math.round([4,5,3,6-1,6-2,6-4].reduce((a,b)=>a+b,0)/6*10)/10).toBe(3.8);
    expect(Math.round(17/4*10)/10).toBe(4.3);
    for(const s of culturalSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
  });
});
