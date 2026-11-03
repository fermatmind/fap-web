import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/eq-dashboard.json";
import { EmotionDashboardPage } from "@/components/questionnaires/EmotionDashboardPage";
import { emotionDashboardSections, emotionDashboardFaq, emotionDashboardSummaries } from "@/components/questionnaires/EmotionDashboardLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
describe("Emotion occurrence bilingual editorial and eight public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, eight guide links, sixteen FAQ and direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<EmotionDashboardPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...emotionDashboardSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...emotionDashboardFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="eq-dashboard-library"] li')).toHaveLength(8);
    for (const p of data.profiles) {
      expect(dom.querySelector(`a[href="/${locale}/tests/explore/eq-dashboard/results/${p.id}"]`)).not.toBeNull();
      expect(text).toContain(emotionDashboardSummaries[p.id][locale]);
    }
    expect(dom.querySelector("#questionnaire-results")).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="eq-dashboard-faq"] h3')).toHaveLength(16);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#eq-dashboard-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[id^=eq-dashboard-reference-] a")).toHaveLength(2);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("keeps bespoke chapter parity and all eight independent readings", () => {
    expect(emotionDashboardSections).toHaveLength(14); expect(emotionDashboardFaq).toHaveLength(10);
    expect(Object.keys(emotionDashboardSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(40);
    for(const s of emotionDashboardSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
    expect(new Set(Object.values(emotionDashboardSummaries).map(t=>t.en)).size).toBe(8);
    expect(new Set(Object.values(emotionDashboardSummaries).map(t=>t.zh)).size).toBe(8);
  });
});
