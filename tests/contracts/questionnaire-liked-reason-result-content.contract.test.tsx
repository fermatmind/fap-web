import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { afterAll, beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/likable-person-test.json";
import content from "@/lib/questionnaires/result-content/liked-reason.json";
import { likedReasonResultProfile } from "@/lib/questionnaires/result-content/liked-reason";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const scroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterAll(() => { if (scroll) Object.defineProperty(Element.prototype, "scrollIntoView", scroll); else Reflect.deleteProperty(Element.prototype, "scrollIntoView"); });
afterEach(() => { cleanup(); sessionStorage.clear(); });

// Actual item-option witnesses, one per reachable leading set; no invented count assignments.
function witnesses() {
  const ids = quiz.directions.map(d => d.id);
  let layer = new Map<string, { counts: number[]; answers: QuestionnaireAnswers }>([["0,0,0,0,0", { counts: ids.map(() => 0), answers: {} }]]);
  for (const question of quiz.questions) {
    const next = new Map<string, { counts: number[]; answers: QuestionnaireAnswers }>();
    for (const state of layer.values()) for (const option of question.options) {
      const counts = [...state.counts]; counts[ids.indexOf(option.directionId)]++;
      next.set(counts.join(","), { counts, answers: { ...state.answers, [question.id]: option.id } });
    }
    layer = next;
  }
  const found = new Map<string, QuestionnaireAnswers>();
  for (const { answers } of layer.values()) {
    const result = scoreDirectionalQuestionnaire(quiz, answers);
    if (result.status === "complete" && !found.has(result.profileId)) found.set(result.profileId, answers);
  }
  return found;
}
const attempts = witnesses();
describe("LIKED_REASON individually authored context and sharing modules", () => {
  it("retains all original reports and all31 identities with distinct bilingual additions", () => {
    const before = JSON.stringify(quiz);
    expect(attempts.size).toBe(31); expect(quiz.questions).toHaveLength(20);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = likedReasonResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(11);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["zh", "en"] as const) for (const sectionIndex of [0, 1])
      expect(new Set(Object.values(content).map(sections => sections[sectionIndex].paragraphs[0][locale])).size).toBe(31);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(likedReasonResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s guide without an attempt or private counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-liked-reason-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector('[aria-label="Raw choice counts for this attempt"], [aria-label="本次原始选择次数"]')).toBeNull();
      for (const section of likedReasonResultProfile(profile).sections) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("keeps the actual %s client scoring and complete reading for single and2/3/4/5-way ties", locale => {
    const profiles = [quiz.profiles[0], quiz.profiles[5], quiz.profiles[15], quiz.profiles[25], quiz.profiles[30]];
    for (const profile of profiles) {
      const answers = attempts.get(profile.id)!;
      const result = scoreDirectionalQuestionnaire(quiz, answers);
      expect(result.status).toBe("complete");
      if (result.status !== "complete") throw new Error("Complete source witness required");
      expect(result.profileId).toBe(profile.id);
      const { container } = render(<QuestionnaireClient quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />);
      expect(container.querySelector("[data-liked-reason-result-reading]")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Start test" : "开始测试" }));
      fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Next" : "下一题" }));
      expect(container.querySelector("[data-liked-reason-result-reading]")).toBeNull();
      for (const [index, question] of quiz.questions.entries()) {
        fireEvent.click(container.querySelector(`input[type="radio"][value="${answers[question.id]}"]`)!);
        fireEvent.click(screen.getByRole("button", { name: index === 19 ? (locale === "en" ? "See full result" : "查看完整结果") : (locale === "en" ? "Next" : "下一题") }));
      }
      const report = container.querySelector(`[data-liked-reason-result-reading="${profile.id}"]`)!;
      expect(report).not.toBeNull();
      for (const section of likedReasonResultProfile(profile).sections) for (const p of section.paragraphs) expect(report.textContent).toContain(p[locale]);
      const counts = container.querySelector(locale === "en" ? '[aria-label="Raw choice counts for this attempt"]' : '[aria-label="本次原始选择次数"]')!;
      expect([...counts.querySelectorAll("dd")].map(el => el.textContent)).toEqual(quiz.directions.map(d => `${result.counts[d.id]} / 8`));
      expect(sessionStorage.length).toBe(0);
      cleanup();
    }
  });
});
