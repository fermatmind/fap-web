import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/social-battery-test.json";
import { SocialBatteryPage } from "@/components/questionnaires/SocialBatteryPage";
import { socialBatterySections, socialBatteryFaq, socialBatterySummaries } from "@/components/questionnaires/SocialBatteryLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("Social battery bilingual context and independent readings", () => {
  it.each(["en", "zh"] as const)("shows every source paragraph, thirteen FAQ and one direct start: %s", locale => {
    const html = renderToStaticMarkup(<SocialBatteryPage quiz={data as Questionnaire} locale={locale} />);
    const dom = document.createElement("div"); dom.innerHTML = html; const text = dom.textContent!;
    for (const s of [...data.guide, ...data.profiles.flatMap(p => p.sections), ...socialBatterySections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...socialBatteryFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="social-battery-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll("[data-social-battery-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="social-battery-faq"] h3')).toHaveLength(13);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#social-battery-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-facet-score]")).toHaveLength(0);
  });
  it("keeps coverage, reversal and research interpretation distinct in both languages", () => {
    expect(socialBatterySections).toHaveLength(8); expect(socialBatteryFaq).toHaveLength(8);
    expect(Object.keys(socialBatterySummaries)).toEqual(data.profiles.map(p => p.id));
    for (const s of socialBatterySections) { expect(s.paragraphs).toHaveLength(2); for (const p of [s.title, ...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); } }
    const copy = JSON.stringify(socialBatterySections); expect(copy).toContain("sum 11 across three rated items gives 3.7"); expect(copy).toContain("not instructions to rest"); expect(copy).toContain("三题覆盖规则");
  });
});
