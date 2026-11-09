import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/superpower-test.json";
import { SuperpowerPage } from "@/components/questionnaires/SuperpowerPage";
import { superpowerSections, superpowerFaq, superpowerSummaries } from "@/components/questionnaires/SuperpowerLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Superpower original preference metaphors and public reading", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<SuperpowerPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...superpowerSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    const storageFaq = data.faq.find(f => f.question.en === "Do drafts, retaking or sharing include my answers?")!;
    for (const f of [...data.faq, ...superpowerFaq]) {
      expect(text).toContain(f.question[locale]);
      if (f !== storageFaq) expect(text).toContain(f.answer[locale]);
    }
    expect(text).not.toContain(storageFaq.answer[locale]);
    expect(text).not.toContain(locale === "zh" ? "24小时" : "24 hours");
    const faq = dom.querySelector('[aria-labelledby="superpower-faq"]')!;
    expect(faq.textContent).toContain(locale === "zh" ? "不保存答题进度或历史记录" : "does not save your progress or keep a history");
    expect(faq.textContent).toContain(locale === "zh" ? "不含答案、计数或内部ID" : "without answers, counts or internal IDs");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="superpower-library"] li')).toHaveLength(5);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/superpower-test/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="superpower-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#superpower-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(0);
    expect(dom.querySelector("#superpower-reference-1 a")?.getAttribute("href")).toBe("https://pubmed.ncbi.nlm.nih.gov/29620401/");
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds the explanations to the actual balanced roster without importing a percentage or tradition", () => {
    expect(superpowerSections).toHaveLength(9); expect(superpowerFaq).toHaveLength(8);
    expect(Object.keys(superpowerSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of superpowerSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    const appearances = Object.fromEntries(data.directions.map(d => [d.id, 0]));
    for (const q of data.questions) { expect(q.options).toHaveLength(4); for (const o of q.options) appearances[o.directionId]++; }
    expect(Object.values(appearances)).toEqual(Array(5).fill(16));
    for (let i = 0; i < 4; i++) for (const d of data.directions) expect(data.questions.filter(q => q.options[i].directionId === d.id)).toHaveLength(4);
    const copy = JSON.stringify(superpowerSections); expect(copy).toContain("5 × 4 = 20"); expect(copy).toContain("not a 50%"); expect(copy).toContain("尚未建立信度");
  });
});
