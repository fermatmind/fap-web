import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/spirit-animal.json";
import { SpiritAnimalPage } from "@/components/questionnaires/SpiritAnimalPage";
import { spiritAnimalSections, spiritAnimalFaq, spiritAnimalSummaries } from "@/components/questionnaires/SpiritAnimalLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Spirit animal original metaphors and public reading", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<SpiritAnimalPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...spiritAnimalSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...spiritAnimalFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="spirit-animal-library"] li')).toHaveLength(9);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/spirit-animal/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="spirit-animal-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#spirit-animal-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(0);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds the explanations to the actual balanced roster without importing a percentage or tradition", () => {
    expect(spiritAnimalSections).toHaveLength(9); expect(spiritAnimalFaq).toHaveLength(8);
    expect(Object.keys(spiritAnimalSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of spiritAnimalSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    const appearances = Object.fromEntries(data.directions.map(d => [d.id, 0]));
    for (const q of data.questions) { expect(q.options).toHaveLength(4); for (const o of q.options) appearances[o.directionId]++; }
    expect(Object.values(appearances)).toEqual(Array(9).fill(8));
    for (let i = 0; i < 4; i++) for (const d of data.directions) expect(data.questions.filter(q => q.options[i].directionId === d.id)).toHaveLength(2);
    const copy = JSON.stringify(spiritAnimalSections); expect(copy).toContain("9 × 2 = 18"); expect(copy).toContain("not 62.5%"); expect(copy).toContain("不能据此建立信度");
  });
});
