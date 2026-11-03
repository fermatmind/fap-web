import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import original from "@/lib/questionnaires/data/disc.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { discEntryDefinition } from "@/lib/questionnaires/discEntry";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { readQuestionnaireDraftWithScorer } from "@/lib/questionnaires/draft";
import { prepareDiscResultProfile } from "@/lib/questionnaires/result-content/disc";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { DiscEntryClient } from "@/components/questionnaires/DiscEntryClient";

const tracking = vi.hoisted(() => ({ trackEvent: vi.fn(), activity: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: tracking.trackEvent }));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: tracking.activity }));
const quiz = original as Questionnaire, entry = discEntryDefinition(quiz);
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterAll(() => { if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll); else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView"); });
afterEach(() => { cleanup(); sessionStorage.clear(); tracking.trackEvent.mockClear(); tracking.activity.mockClear(); });

describe("DISC entry and selected complete engine", () => {
  it("preserves scoring/draft identity while deferring full readings", () => {
    expect(entry.questions).toBe(quiz.questions); expect(entry.directions).toBe(quiz.directions);
    expect(entry.profiles).toEqual(quiz.profiles.map(({ id, directionIds }) => ({ id, directionIds })));
    expect(entry.profiles.some(p => "sections" in p)).toBe(false);
    expect(quiz.profiles.map(prepareDiscResultProfile)).toEqual(prepareQuestionnaireResultReadings(quiz).profiles);
    for (const values of [[], ["A"], Array(24).fill("A"), Array(24).fill("B")]) {
      const answers = Object.fromEntries(values.map((value, i) => [quiz.questions[i].id, value]));
      expect(scoreDirectionalQuestionnaire(entry, answers)).toEqual(scoreDirectionalQuestionnaire(quiz, answers));
      const raw = JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers });
      expect(readQuestionnaireDraftWithScorer(entry, raw, scoreDirectionalQuestionnaire)).toEqual(readQuestionnaireDraftWithScorer(quiz, raw, scoreDirectionalQuestionnaire));
    }
    for (const patch of [{ version: "foreign" }, { savedAt: 0 }, { answers: { unknown: "A" } }, { answers: { [quiz.questions[0].id]: "foreign" } }]) {
      const raw = JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: {}, ...patch });
      expect(readQuestionnaireDraftWithScorer(entry, raw, scoreDirectionalQuestionnaire)).toBeNull();
    }
  });
  it.each(["en", "zh"] as const)("preserves once-only %s start/completion/view identities across the lazy boundary", async locale => {
    const zh = locale === "zh";
    render(<StrictMode><DiscEntryClient quiz={entry} locale={locale} /></StrictMode>);
    fireEvent.click(screen.getByRole("button", { name: zh ? "开始测试" : "Start test" }));
    expect(tracking.trackEvent.mock.calls.filter(([event]) => event === "start_test")).toHaveLength(1);
    await screen.findAllByRole("radio");
    expect(tracking.trackEvent.mock.calls.filter(([event]) => event === "start_test")).toHaveLength(1);
    for (let i = 0; i < quiz.questions.length; i++) {
      fireEvent.click(screen.getAllByRole("radio")[0]);
      fireEvent.click(screen.getByRole("button", { name: i === 23 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next") }));
    }
    for (const event of ["start_test", "complete_test", "view_result"]) {
      const calls = tracking.trackEvent.mock.calls.filter(([name]) => name === event);
      expect(calls).toHaveLength(1);
      expect(calls[0][1]).toEqual({ slug: "disc", locale, entry_surface: "questionnaire", scale_code: quiz.code, form_code: quiz.source.formCode, test_type: "self_report", page_type: "test_detail" });
    }
    expect(tracking.activity.mock.calls.filter(([, , , action]) => action === "start")).toHaveLength(1);
  });
});
