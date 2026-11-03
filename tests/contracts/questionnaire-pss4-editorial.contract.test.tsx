import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "@/lib/questionnaires/data/perceived-stress-scale-4.json";
import { isPss4ConfigurationValid } from "@/lib/questionnaires/pss4";
import { pss4Sections, pss4Faq } from "@/components/questionnaires/Pss4LandingEditorial";
import { Pss4Page } from "@/components/questionnaires/Pss4Page";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("PSS-4 bilingual editorial without changing the published form", () => {
  it.each(["en", "zh"] as const)("preserves the complete source readings and gives one direct start: %s", locale => {
    if (!isPss4ConfigurationValid(data)) throw Error("Invalid source");
    const html = renderToStaticMarkup(<Pss4Page quiz={data} locale={locale} />);
    const dom = document.createElement("div"); dom.innerHTML = html;
    const text = dom.textContent!;
    for (const section of [...data.guide, ...data.profiles[0].sections]) for (const paragraph of section.paragraphs) expect(text).toContain(paragraph[locale]);
    for (const section of pss4Sections) { expect(text).toContain(section.title[locale]); for (const paragraph of section.paragraphs) expect(text).toContain(paragraph[locale]); }
    for (const faq of [...data.faq, ...pss4Faq]) expect(text).toContain(faq.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"][required],input[type="checkbox"]:checked')).toHaveLength(0);expect(dom.querySelector('[data-entertainment-activity-opt-in]')).not.toBeNull();
    expect(dom.querySelectorAll("[data-pss4-full-guide]")).toHaveLength(1);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#pss4-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="pss4-faq"] h3')).toHaveLength(14);
  });
  it("keeps both languages complete and the new prose specific to four-item scoring", () => {
    expect(pss4Sections).toHaveLength(8); expect(pss4Faq).toHaveLength(8);
    for (const s of pss4Sections) { expect(s.paragraphs).toHaveLength(2); for (const t of [s.title, ...s.paragraphs]) { expect(t.en.length).toBeGreaterThan(15); expect(t.zh.length).toBeGreaterThan(8); } }
    const copy = JSON.stringify(pss4Sections); expect(copy).toContain("x1 + (4 − x2) + (4 − x3) + x4"); expect(copy).toContain("both produce 8"); expect(copy).toContain("independent FermatMind translation");
  });
});
