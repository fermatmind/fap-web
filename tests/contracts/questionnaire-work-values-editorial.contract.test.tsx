import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/values-assessment.json";
import { WorkValuesPage } from "@/components/questionnaires/WorkValuesPage";
import { workValuesSections, workValuesFaq, workValuesSummaries } from "@/components/questionnaires/WorkValuesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("Work priorities bilingual editorial and ten public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, ten guide links, sixteen FAQ and direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<WorkValuesPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...workValuesSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...workValuesFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="values-assessment-library"] li')).toHaveLength(10);
    for (const p of data.profiles) {
      expect(dom.querySelector(`a[href="/${locale}/tests/explore/values-assessment/results/${p.id}"]`)).not.toBeNull();
      expect(text).toContain(workValuesSummaries[p.id][locale]);
    }
    expect(dom.querySelector("#questionnaire-results")).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="values-assessment-faq"] h3')).toHaveLength(16);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#values-assessment-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[id^=values-assessment-reference-] a")).toHaveLength(1);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("keeps bespoke chapter parity and every single and highest-tie result", () => {
    expect(workValuesSections).toHaveLength(15); expect(workValuesFaq).toHaveLength(10);
    expect(Object.keys(workValuesSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(30);
    for(const s of workValuesSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(new Set(Object.values(workValuesSummaries).map(t=>t.en)).size).toBe(10);
    expect(new Set(Object.values(workValuesSummaries).map(t=>t.zh)).size).toBe(10);
  });
});
