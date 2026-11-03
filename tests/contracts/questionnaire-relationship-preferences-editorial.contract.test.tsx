import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { relationshipPreferencesLandingSections, relationshipPreferencesLandingFaq } from "@/components/questionnaires/RelationshipPreferencesLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import raw from "@/lib/questionnaires/data/relationship-preferences.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
function witness(leftCounts: number[]) {
  const answers: QuestionnaireAnswers = {};
  quiz.pairedDimensions!.forEach((axis, index) => {
    const rows = quiz.questions.filter(q => q.options.some(o => o.directionId === axis.poleIds[0]));
    rows.forEach((q, i) => { answers[q.id] = q.options.find(o => o.directionId === axis.poleIds[i < leftCounts[index] ? 0 : 1])!.id; });
  });
  return answers;
}
describe("individual two-axis relationship arrangement editorial", () => {
  it("provides a shared calendar and a separately adjustable window illustration", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="relationship-preferences" category="relationships" />);
    expect(html).toContain('data-composition="arrangements-shared-calendar:arrangements-open-window:workspace"');
    for (const motif of ["arrangements-shared-calendar", "arrangements-open-window"]) expect(html).toContain(`data-${motif}="true"`);
  });
  it("reproduces worked count pairs and a one-answer tie change without a combined type", () => {
    for (const [counts, ids] of [
      [[8, 5], ["shared-participation", "flexible-experience"]],
      [[6, 9], ["contact-space-tie", "certainty-planning"]],
      [[7, 6], ["shared-participation", "certainty-flexibility-tie"]],
    ] as const) {
      const result = scoreQuestionnaire(quiz, witness([...counts]));
      if (result.status !== "complete" || !("pairedDimensions" in result)) throw new Error("No two-axis result");
      expect(result.pairedProfileIds).toEqual(ids);
      result.pairedDimensions.forEach((axis, i) => expect(Object.values(axis.counts)).toEqual([counts[i], 12 - counts[i]]));
      expect("profileId" in result).toBe(false);
    }
    const answers = witness([6, 6]);
    const question = quiz.questions.find(q => q.options.some(o => o.id === answers[q.id] && o.directionId === "AUTONOMY_PRIORITY"))!;
    answers[question.id] = question.options.find(o => o.directionId === "CONNECTION_PRIORITY")!.id;
    const result = scoreQuestionnaire(quiz, answers);
    expect(result).toMatchObject({ status: "complete", pairedProfileIds: ["shared-participation", "certainty-flexibility-tie"] });
  });
  it("renders all original and supplementary bilingual copy, fourteen FAQs and both research sources", async () => {
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
      const body = norm(dom.textContent ?? ""); expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"]>section')).toHaveLength(14);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"]>ul>li')).toHaveLength(6);
      expect(dom.querySelectorAll(".explore-reading-section")).toHaveLength(12);
      for (const section of [...quiz.guide, ...relationshipPreferencesLandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
      for (const faq of [...quiz.faq, ...relationshipPreferencesLandingFaq]) { expect(body).toContain(norm(faq.question[locale])); expect(body).toContain(norm(faq.answer[locale])); }
      expect(body).toContain(norm(quiz.instructions![locale]));
      for (const link of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
      for (const i of [1, 2]) expect(dom.querySelector(`a[href="#relationship-preferences-reference-${i}"]`)).not.toBeNull();
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
