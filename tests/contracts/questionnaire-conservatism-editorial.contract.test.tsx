import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { conservatismLandingSections, conservatismLandingFaq } from "@/components/questionnaires/ConservatismLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/conservatism.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("historical SECS two-domain editorial", () => {
  it("illustrates a position map and independent counterexample check", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="conservatism" category="everyday" />);
    for (const motif of ["secs-two-thermometers", "secs-historical-page"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("reproduces reversals, same-mean contrasts and domain-specific missingness", () => {
    const all = (v: string) => Object.fromEntries(quiz.questions.map(q => [q.id, v]));
    const input = all("50"); input.SECS_01 = "30"; input.SECS_05 = "70";
    const result = scoreQuestionnaire(quiz, input);
    if (result.status !== "complete" || !("secsDomains" in result)) throw new Error("No SECS result");
    expect(result.secsDomains.social.sum).toBe(370); expect(result.secsDomains.social.mean!.toFixed(2)).toBe("52.86");
    expect(result.secsDomains.economic).toEqual({ rated: 5, total: 5, sum: 230, mean: 46 });
    input.SECS_01 = "40";
    const changed = scoreQuestionnaire(quiz, input);
    expect(changed).toMatchObject({ secsDomains: { social: { sum: 360, mean: 360 / 7 } } });
    const mixed = all("50"); mixed.SECS_02 = "80"; mixed.SECS_05 = "80";
    expect(scoreQuestionnaire(quiz, mixed)).toMatchObject({ secsDomains: { economic: { sum: 250, mean: 50 } } });
    mixed.SECS_01 = "na";
    expect(scoreQuestionnaire(quiz, mixed)).toMatchObject({ secsDomains: { social: { rated: 6, sum: null, mean: null }, economic: { sum: 250, mean: 50 } } });
  });
  it("renders original and supplemental bilingual content with fourteen FAQs and complete guide access", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(2);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(8);
      for (const section of [...quiz.guide, ...conservatismLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...conservatismLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2, 3]) expect(dom.querySelector(`a[href="#conservatism-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
