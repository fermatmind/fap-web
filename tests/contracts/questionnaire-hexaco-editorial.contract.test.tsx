import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { hexacoLandingSections, hexacoLandingFaq } from "@/components/questionnaires/HexacoLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/hexaco.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
const all = (v = "3"): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, v]));
describe("individual HEXACO 240-item bilingual editorial", () => {
  it("provides six equal domain lenses and a four-facet reading card without fabricated results", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="hexaco" category="framework" />);
    expect(html).toContain('data-composition="hexaco-six-lenses:hexaco-facet-folds:workspace"');
    for (const motif of ["hexaco-six-lenses", "hexaco-facet-folds"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("checks fresh mixed midpoint, reverse-keyed maximum and domain-specific NA witnesses", () => {
    const maximum = Object.fromEntries(quiz.questions.map(q => [q.id, q.reverse ? "1" : "5"]));
    const mixed = all();
    for (const d of quiz.directions) quiz.questions.filter(q => q.options[0].directionId === d.id).forEach((q, i) => { const keyed = i < 20 ? 1 : 5; mixed[q.id] = String(q.reverse ? 6 - keyed : keyed); });
    for (const [answers, sum] of [[maximum, 200], [mixed, 120], [all(), 120]] as const) {
      const result = scoreQuestionnaire(quiz, answers); expect(result.status).toBe("complete");
      if (result.status !== "complete" || !("facets" in result)) throw new Error("No six-domain result");
      for (const d of quiz.directions) expect(result.facets[d.id]).toMatchObject({ rated: 40, total: 40, sum });
    }
    const answers = all(); answers.HEX_001 = "na";
    const result = scoreQuestionnaire(quiz, answers);
    if (result.status !== "complete" || !("facets" in result)) throw new Error("No six-domain result");
    expect(result.facets.H).toMatchObject({ rated: 39, mean: null });
    for (const d of quiz.directions.filter(d => d.id !== "H")) expect(result.facets[d.id]).toMatchObject({ rated: 40, sum: 120 });
  });
  it("renders all original and new body, fourteen FAQs and six public guides in both languages", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({params: Promise.resolve({locale, slug: quiz.slug})}));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(6);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for (const section of [...quiz.guide, ...hexacoLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...hexacoLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3, 4, 5, 6]) expect(dom.querySelector(`a[href="#hexaco-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
