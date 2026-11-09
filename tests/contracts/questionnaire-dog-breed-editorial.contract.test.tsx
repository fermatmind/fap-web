import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/what-dog-breed-am-i.json";
import { DogBreedPage } from "@/components/questionnaires/DogBreedPage";
import { dogBreedSections, dogBreedFaq, dogBreedSummaries } from "@/components/questionnaires/DogBreedLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Dog breed original metaphors and public reading", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<DogBreedPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...dogBreedSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    const storageFaq = data.faq.find(f => f.question.en === "How do drafts, retaking and sharing work?")!;
    for (const f of [...data.faq, ...dogBreedFaq]) {
      expect(text).toContain(f.question[locale]);
      if (f !== storageFaq) expect(text).toContain(f.answer[locale]);
    }
    expect(text).not.toContain(storageFaq.answer[locale]);
    expect(text).not.toContain(locale === "zh" ? "24小时" : "24 hours");
    const faq = dom.querySelector('[aria-labelledby="dog-breed-faq"]')!;
    expect(faq.textContent).toContain(locale === "zh" ? "不保存答题进度或历史记录" : "does not save your progress or keep a history");
    expect(faq.textContent).toContain(locale === "zh" ? "不含答案、计数或内部ID" : "without answers, counts or internal IDs");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="dog-breed-library"] li')).toHaveLength(6);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/what-dog-breed-am-i/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="dog-breed-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#dog-breed-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(0);
    expect(dom.querySelector("#dog-breed-reference-1 a")?.getAttribute("href")).toBe("https://pubmed.ncbi.nlm.nih.gov/35482869/");
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds the explanations to the actual balanced roster without importing a percentage or tradition", () => {
    expect(dogBreedSections).toHaveLength(9); expect(dogBreedFaq).toHaveLength(8);
    expect(Object.keys(dogBreedSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of dogBreedSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    const appearances = Object.fromEntries(data.directions.map(d => [d.id, 0]));
    for (const q of data.questions) { expect(q.options).toHaveLength(4); for (const o of q.options) appearances[o.directionId]++; }
    expect(Object.values(appearances)).toEqual(Array(6).fill(8));
    for (let i = 0; i < 4; i++) for (const d of data.directions) expect(data.questions.filter(q => q.options[i].directionId === d.id)).toHaveLength(2);
    const copy = JSON.stringify(dogBreedSections); expect(copy).toContain("6 × 2 = 12"); expect(copy).toContain("not a 75%"); expect(copy).toContain("尚未建立信度");
  });
});
