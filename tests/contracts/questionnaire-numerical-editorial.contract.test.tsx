import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { numericalReasoningLandingSections, numericalReasoningLandingFaq } from "@/components/questionnaires/NumericalReasoningLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/numerical-reasoning.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("numerical reasoning explanatory editorial", () => {
  it("illustrates weighted data and denominator checking", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="numerical-reasoning" category="everyday" />);
    for (const motif of ["numerical-weighted-table", "numerical-denominator"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("independently recomputes the new examples without changing question material", () => {
    expect((200 - 160) / 160 * 100).toBe(25);
    expect((25 - 20) / 20 * 100).toBe(25);
    expect(600 * 1.1 * 0.9).toBe(594);
    expect(84 / 0.35).toBeCloseTo(240, 12);
    expect([119 / 7 * 2, 119 / 7 * 5]).toEqual([34, 85]);
    expect([4 * 3, 5 * 3, 7 * 5]).toEqual([12, 15, 35]);
    expect((12 * 15 + 28 * 25) / 40).toBe(22);
    expect((50 * 0.2 + 150 * 0.4) / 200 * 100).toBe(35);
    expect(168 / (2 + 48 / 60)).toBeCloseTo(60, 12);
    expect((6 + 9) * 8).toBe(120);
    expect(180 / 2.4).toBe(75);
    // Rational final-step rounding: 2/7*100 to one decimal, half-up.
    expect(Number((BigInt(2000) * BigInt(2) + BigInt(7)) / (BigInt(7) * BigInt(2))) / 10).toBe(28.6);
    for (const locale of ["en", "zh"] as const) {
      const text = numericalReasoningLandingSections.flatMap(s => s.paragraphs.map(p => p[locale])).join(" ");
      for (const example of ["594", "240", "34", "85", "35", "120", "75", "28.6"]) expect(text).toContain(example);
    }
  });
  it("renders original and supplemental bilingual content with fourteen FAQs and complete guide access", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(5);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(11);
      for (const section of [...quiz.guide, ...numericalReasoningLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...numericalReasoningLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3]) expect(dom.querySelector(`a[href="#numerical-reasoning-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
