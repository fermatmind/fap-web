import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/food-choice.json";
import { FoodChoicePage } from "@/components/questionnaires/FoodChoicePage";
import { foodChoiceSections, foodChoiceFaq, foodChoiceSummaries } from "@/components/questionnaires/FoodChoiceLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("Food presentation bilingual editorial and seven public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, seven guide links, sixteen FAQ and direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<FoodChoicePage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...foodChoiceSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...foodChoiceFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="food-choice-library"] li')).toHaveLength(7);
    for (const p of data.profiles) {
      expect(dom.querySelector(`a[href="/${locale}/tests/explore/food-choice/results/${p.id}"]`)).not.toBeNull();
      expect(text).toContain(foodChoiceSummaries[p.id][locale]);
    }
    expect(dom.querySelector("#questionnaire-results")).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="food-choice-faq"] h3')).toHaveLength(16);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#food-choice-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[id^=food-choice-reference-] a")).toHaveLength(2);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("keeps bespoke chapter parity and every single and highest-tie result", () => {
    expect(foodChoiceSections).toHaveLength(11); expect(foodChoiceFaq).toHaveLength(10);
    expect(Object.keys(foodChoiceSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(12);
    for(const s of foodChoiceSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(new Set(Object.values(foodChoiceSummaries).map(t=>t.en)).size).toBe(7);
    expect(new Set(Object.values(foodChoiceSummaries).map(t=>t.zh)).size).toBe(7);
  });
});
