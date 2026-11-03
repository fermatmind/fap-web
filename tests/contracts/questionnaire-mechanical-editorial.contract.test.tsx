import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { mechanicalReasoningLandingSections, mechanicalReasoningLandingFaq } from "@/components/questionnaires/MechanicalReasoningLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/mechanical-reasoning.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("mechanical reasoning explanatory editorial", () => {
  it("illustrates a lever model and separate spring-pressure relationships", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="mechanical-reasoning" category="everyday" />);
    for (const motif of ["mechanics-balance-ratio", "mechanics-spring-pressure"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("independently recomputes the new examples without changing question material", () => {
    expect(24 * 0.5 / 0.3).toBe(40);
    expect(200 * 24 / 60).toBe(80);
    expect(1.5 * 60 / 24).toBe(3.75);
    expect(280 / 4).toBe(70);
    expect(4 * 0.3).toBe(1.2);
    expect(70 * 1.2).toBe(84);
    expect(280 * 0.3).toBe(84);
    expect(320 * 15 / 1000).toBe(4.8);
    expect(4.8 / 640 * 1000).toBe(7.5);
    expect(850 * 10 * 0.6).toBe(5100);
    expect(100000 + 5100).toBe(105100);
    expect(16 * 25 / 5).toBe(80);
    expect(5 * 4 / 25).toBe(0.8);
    expect(16 * 4 / 100).toBe(0.64);
    expect(80 * 0.8 / 100).toBe(0.64);
    expect([2, 5, 3, 1, 4].reduce((a, b) => a + b, 0)).toBe(15);
    for (const locale of ["en", "zh"] as const) {
      const text = mechanicalReasoningLandingSections.flatMap(s => s.paragraphs.map(p => p[locale])).join(" ");
      for (const example of ["40", "80", "3.75", "84", "4.8", "7.5", "5100", "105100", "0.64"]) expect(text).toContain(example);
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
      for (const section of [...quiz.guide, ...mechanicalReasoningLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...mechanicalReasoningLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3, 4, 5]) expect(dom.querySelector(`a[href="#mechanical-reasoning-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
