import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { afterAll, beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/disc.json";
import content from "@/lib/questionnaires/result-content/disc.json";
import { discResultProfile } from "@/lib/questionnaires/result-content/disc";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterAll(() => {
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});
afterEach(() => { cleanup(); sessionStorage.clear(); });

describe("DISC authored result readings", () => {
  it("covers each existing result without changing its identity or source profile", () => {
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    const before = JSON.stringify(quiz);
    for (const profile of quiz.profiles) {
      const reading = discResultProfile(profile);
      expect(reading.id).toBe(profile.id);
      expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.title).toEqual(profile.title);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
      for (const locale of ["en", "zh"] as const) {
        const root = document.createElement("div");
        root.innerHTML = renderToStaticMarkup(<QuestionnaireResultReading quizSlug="disc" profile={prepareResultProfile("disc", profile)} locale={locale} headingLevel={2} />);
        expect(root.querySelectorAll("h2")).toHaveLength(reading.sections.length);
        const ids = [...root.querySelectorAll("[id]")].map(el => el.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const link of root.querySelectorAll('nav a[href^="#"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
        for (const id of ["counts", "cost", "scene", "experiment", "conversation", "reality-check", "share", "method"])
          expect(root.querySelector(`#report-editorial-${id}`)?.textContent?.trim()).toBeTruthy();
        if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
        expect(root.querySelector('a[href="https://www.everythingdisc.com/what-is-disc/"]')).not.toBeNull();
      }
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "unrecognised" };
    expect(discResultProfile(unknown)).toBe(unknown);
  });

  it.each(["en", "zh"] as const)("shows the same authored content only after a complete %s attempt", locale => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, (q.options.find(o => o.directionId === "DOMINANCE") ?? q.options[0]).id]));
    const result = scoreDirectionalQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Synthetic complete attempt required");
    const profile = quiz.profiles.find(p => p.id === result.profileId)!;
    const { container } = render(<QuestionnaireClient quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />);
    expect(container.querySelector("[data-disc-result-reading]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Start test" : "开始测试" }));
    fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Next" : "下一题" }));
    expect(container.querySelector("[data-disc-result-reading]")).toBeNull();
    for (const [index, question] of quiz.questions.entries()) {
      fireEvent.click(container.querySelector(`input[type="radio"][value="${answers[question.id]}"]`)!);
      fireEvent.click(screen.getByRole("button", { name: index === 23 ? (locale === "en" ? "See full result" : "查看完整结果") : (locale === "en" ? "Next" : "下一题") }));
    }
    const report = container.querySelector(`[data-disc-result-reading="${profile.id}"]`)!;
    expect(report).not.toBeNull();
    for (const section of discResultProfile(profile).sections) for (const paragraph of section.paragraphs) expect(report.textContent).toContain(paragraph[locale]);
    expect(sessionStorage.length).toBe(0);
  });
});
