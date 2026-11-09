import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { scoreMentalAgeQuestionnaire } from "@/lib/questionnaires/mentalAge";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { QuestionnaireRunner } from "@/components/questionnaires/QuestionnaireRunner";
import { MentalAgeClassicResult } from "@/components/questionnaires/MentalAgeClassicClient";
import { MoonPhaseComparison } from "@/components/questionnaires/MoonPhaseComparison";
import { BleachCharacterDirectory } from "@/components/questionnaires/BleachCharacterDirectory";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: vi.fn() }));
const scrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
afterAll(() => {
  if (scrollIntoView) Object.defineProperty(Element.prototype, "scrollIntoView", scrollIntoView);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

const load = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const answersFor = (quiz: Questionnaire) => Object.fromEntries(quiz.questions.map(question => [question.id, question.options[0].id]));
const rootFor = (html: string) => { const root = document.createElement("div"); root.innerHTML = html; return root; };
function verifyGuides(root: Element, locale: "en" | "zh", newTab: boolean, collection: "explore" | "play" = "explore") {
  const links = root.querySelectorAll<HTMLAnchorElement>('a[href*="/results/"]');
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.getAttribute("href")).toMatch(new RegExp(`^/${locale}/tests/${collection}/[^/?]+/results/[^/?]+$`));
    expect(link.getAttribute("target")).toBe(newTab ? "_blank" : null);
    if (newTab) {
      expect(link.rel.split(/\s+/)).toContain("noopener");
      expect(link.textContent).toContain(locale === "zh" ? "新标签页" : "new tab");
    }
  }
}

describe("public guide navigation from an in-memory result", () => {
  for (const locale of ["en", "zh"] as const) {
    it.each(["hogwarts-house-quiz", "hazbin-hotel-character-quiz", "hello-kitty", "spirit-animal", "flower", "what-dog-breed-am-i", "mythical-creature", "superpower-test", "jungian-archetype", "temperament", "leadership-style", "aura-color", "philosopher-personality-test", "space-marine-chapter", "bleach", "moon-phase", "cyberpunk-edgerunners", "chiikawa"])(`${locale} opens every result guide for %s in an announced new tab`, slug => {
      const quiz = load(slug), result = scoreQuestionnaire(quiz, answersFor(quiz));
      if (result.status !== "complete" || !("profileIds" in result)) throw new Error("Expected a complete character result");
      verifyGuides(rootFor(renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale} />)), locale, true);
    });
    it(`${locale} keeps entry samples and other character tests in the same tab`, () => {
      for (const slug of ["chiikawa", "anime-character-archetype-test"]) {
        const quiz = load(slug), result = scoreQuestionnaire(quiz, answersFor(quiz));
        if (result.status !== "complete" || !("profileIds" in result)) throw new Error("Expected a complete result");
        verifyGuides(rootFor(renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale} sampleId={slug === "chiikawa" ? "entry-sample" : undefined} />)), locale, false);
      }
    });
    it(`${locale} keeps public comparison pages in the same tab`, () => {
      verifyGuides(rootFor(renderToStaticMarkup(<MoonPhaseComparison locale={locale} />)), locale, false);
      verifyGuides(rootFor(renderToStaticMarkup(<BleachCharacterDirectory quiz={load("bleach")} locale={locale} publicGuide />)), locale, false);
    });
    it(`${locale} opens the mental-age result guide without exposing answers`, () => {
      const quiz = load("mental-age"), answers = answersFor(quiz), result = scoreMentalAgeQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Expected a complete age result");
      verifyGuides(rootFor(renderToStaticMarkup(<MentalAgeClassicResult quiz={quiz} result={result} answers={answers} locale={locale} />)), locale, true);
    });
    it.each(["adult-age-preferences", "disc", "response-color"])(`${locale} opens the %s result guide after the real answering handler`, slug => {
      const quiz = load(slug);
      const { container } = render(<QuestionnaireRunner quiz={quiz} locale={locale} scoreQuestionnaire={scoreQuestionnaire} startOnEntry />);
      for (const question of quiz.questions) {
        const radio = container.querySelector<HTMLInputElement>(`input[name="${question.id}"][value="${question.options[0].id}"]`);
        if (!radio) throw new Error(`Missing question ${question.id}`);
        fireEvent.click(radio);
        fireEvent.click(container.querySelector("[data-questionnaire-next]")!);
      }
      expect(container.querySelector("#take-test")?.getAttribute("data-stage")).toBe("result");
      verifyGuides(container, locale, true, slug === "response-color" ? "play" : "explore");
    });
  }
});
