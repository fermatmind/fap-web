import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/mythical-creature.json";
import { MythicalCreaturePage } from "@/components/questionnaires/MythicalCreaturePage";
import { mythicalCreatureSections, mythicalCreatureFaq, mythicalCreatureSummaries } from "@/components/questionnaires/MythicalCreatureLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Mythical creature original metaphors and public reading", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<MythicalCreaturePage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...mythicalCreatureSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    const storageFaq = data.faq.find(f => f.question.en === "What do drafts, retaking and sharing contain?")!;
    for (const f of [...data.faq, ...mythicalCreatureFaq]) {
      expect(text).toContain(f.question[locale]);
      if (f !== storageFaq) expect(text).toContain(f.answer[locale]);
    }
    expect(text).not.toContain(storageFaq.answer[locale]);
    expect(text).not.toContain(locale === "zh" ? "24小时" : "24 hours");
    const faq = dom.querySelector('[aria-labelledby="mythical-creature-faq"]')!;
    expect(faq.textContent).toContain(locale === "zh" ? "不保存答题进度或历史记录" : "does not save your progress or keep a history");
    expect(faq.textContent).toContain(locale === "zh" ? "不含答案、计数或内部ID" : "without answers, counts or internal IDs");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="mythical-creature-library"] li')).toHaveLength(6);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/mythical-creature/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="mythical-creature-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#mythical-creature-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(0);
    expect(dom.querySelector("#mythical-creature-reference-1 a")?.getAttribute("href")).toBe("https://www.amnh.org/explore/ology/ology-cards/279-unicorn?view=modal");
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("binds the explanations to the actual balanced roster without importing a percentage or tradition", () => {
    expect(mythicalCreatureSections).toHaveLength(9); expect(mythicalCreatureFaq).toHaveLength(8);
    expect(Object.keys(mythicalCreatureSummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of mythicalCreatureSections) for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    const appearances = Object.fromEntries(data.directions.map(d => [d.id, 0]));
    for (const q of data.questions) { expect(q.options).toHaveLength(4); for (const o of q.options) appearances[o.directionId]++; }
    expect(Object.values(appearances)).toEqual(Array(6).fill(12));
    for (let i = 0; i < 4; i++) for (const d of data.directions) expect(data.questions.filter(q => q.options[i].directionId === d.id)).toHaveLength(3);
    const copy = JSON.stringify(mythicalCreatureSections); expect(copy).toContain("6 × 3 = 18"); expect(copy).toContain("not a 50%"); expect(copy).toContain("尚未建立信度");
  });
});
