import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { trackEvent } from "@/lib/analytics";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const text = (en: string, zh = en): Text => ({ en, zh });
// Deliberately tiny test-only bank; never registered as a product or counted as content assets.
const quiz: Questionnaire = {
  slug: "practice-contract-fixture", code: "TEST_ONLY_PRACTICE", kind: "practice", version: "test.1", updated: "2026-10-26", category: "Test fixture",
  title: text("Practice contract fixture", "练习契约样本"), description: text("Only a test fixture", "仅供测试的样本"), seoTitle: text("Test fixture", "测试样本"), minutes: 1,
  introduction: text("Original test-only questions", "原创测试专用题目"), instructions: text("Choose one answer for each question. All explanations appear after completing the bank.", "每题选择一个答案，全部答完后显示解析。"),
  source: { kind: "test-only", formCode: "test-only", itemBankVersion: "test.1", scoringVersion: "test.1", resultContentVersion: "test.1", itemBankSha256: "0".repeat(64), resultContentSha256: "0".repeat(64), psychometricValidationCompleted: false },
  directions: [{ id: "arithmetic", title: text("Arithmetic", "算术"), itemCount: 2 }, { id: "code", title: text("Code reading", "代码阅读"), itemCount: 2 }],
  questions: [
    { id: "q1", prompt: text("2 + 2 = ?"), correctOptionId: "a", explanation: text("Two pairs make four.", "两组各二，合计四。"), options: [{ id: "a", label: text("4"), directionId: "arithmetic" }, { id: "b", label: text("5"), directionId: "arithmetic" }] },
    { id: "q2", prompt: text("3 × 3 = ?"), correctOptionId: "b", explanation: text("Three groups of three make nine.", "三组三个，合计九。"), options: [{ id: "a", label: text("6"), directionId: "arithmetic" }, { id: "b", label: text("9"), directionId: "arithmetic" }] },
    { id: "q3", prompt: text("JavaScript: typeof 3"), correctOptionId: "b", explanation: text("The numeric literal has type number.", "数值字面量的类型为number。"), options: [{ id: "a", label: text("string"), directionId: "code" }, { id: "b", label: text("number"), directionId: "code" }] },
    { id: "q4", prompt: text('JavaScript: "ab".length'), correctOptionId: "a", explanation: text("This ASCII string contains two code units.", "该ASCII字符串包含两个代码单元。"), options: [{ id: "a", label: text("2"), directionId: "code" }, { id: "b", label: text("3"), directionId: "code" }] },
  ],
  profiles: ["arithmetic", "code"].map(id => ({ id, directionIds: [id], title: text(`${id} revision`, `${id}复习`), headline: text("Read the explanation", "阅读说明"), summary: text("Test-only revision text", "测试专用复习文本"), scoreReading: text("Counts in this bank only", "只描述本题本的正确数"), sections: [{ id: "review", title: text("Review the method", "回看方法"), paragraphs: [text(`Revision text for ${id}`, `${id}的方法说明`)] }] })),
  guide: [], faq: [],
};
const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const all = { q1: "a", q2: "b", q3: "b", q4: "a" };
afterEach(() => {
  cleanup(); window.sessionStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoView);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("standard-answer practice shared runtime", () => {
  it("recomputes all16 answer combinations with independent item and section counts, without personality assignments", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (let bits = 0; bits < 16; bits++) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, bits & (1 << i) ? "b" : "a"]));
      const correct = [answers.q1 === "a", answers.q2 === "b", answers.q3 === "b", answers.q4 === "a"];
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw Error("Practice result missing");
      expect(result.practice.correct).toBe(correct.filter(Boolean).length); expect(result.practice.total).toBe(4);
      expect(result.practice.sections).toEqual({ arithmetic: { correct: correct.slice(0, 2).filter(Boolean).length, total: 2 }, code: { correct: correct.slice(2).filter(Boolean).length, total: 2 } });
      expect(result.practice.items.map(i => i.correct)).toEqual(correct);
      for (const field of ["profileId", "profileIds", "leaders", "percentile", "ability", "grade"]) expect(result).not.toHaveProperty(field);
    }
  });

  it("withholds correctness on partial answers and rejects unknown, malformed or inherited answer containers", () => {
    expect(scoreQuestionnaire(quiz, { q1: "a" })).toEqual({ status: "incomplete", answered: 1 });
    for (const invalid of [null, [], new Date(), { q1: 4 }, { q1: "missing" }, { ...all, unknown: "a" }, Object.create(all)]) {
      const result = scoreQuestionnaire(quiz, invalid); expect(result.status).toBe("invalid"); expect(result).not.toHaveProperty("practice");
    }
    const empty = Object.create(null); expect(scoreQuestionnaire(quiz, empty)).toEqual({ status: "incomplete", answered: 0 });
  });

  it("fails closed for invalid keys, missing explanations, mixed sections and malformed configuration", () => {
    const changes = [
      (q: Questionnaire) => { q.questions[0].correctOptionId = "unknown"; },
      (q: Questionnaire) => { delete q.questions[0].explanation; },
      (q: Questionnaire) => { q.questions[0].explanation!.zh = ""; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "code"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 1; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.questions[0].reverse = 1 as never; },
      (q: Questionnaire) => { q.questions[0].options[1].id = "a"; },
      (q: Questionnaire) => { q.questions[0].options = q.questions[0].options.slice(0, 1); },
      (q: Questionnaire) => { q.directions[0].itemCount = 3; },
      (q: Questionnaire) => { q.profiles[1].directionIds = ["arithmetic"]; },
      (q: Questionnaire) => { q.questions[0] = null as never; },
      (q: Questionnaire) => { q.questions[0].options[0] = null as never; },
    ];
    for (const change of changes) { const bad = structuredClone(quiz); change(bad); expect(isPracticeConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, all)).toEqual({ status: "unavailable", answered: 0 }); }
    expect(isPracticeConfigurationValid(null as never)).toBe(false);
  });

  it("retains opt-in versioned24h drafts without treating a saved partial as a result", () => {
    const now = 1_000_000_000, raw = (savedAt = now, version = quiz.version) => JSON.stringify({ savedAt, version, answers: { q1: "a" } });
    expect(readQuestionnaireDraft(quiz, raw(), now)).toEqual({ q1: "a" });
    expect(readQuestionnaireDraft(quiz, raw(now - 86_400_000), now)).toBeNull(); expect(readQuestionnaireDraft(quiz, raw(now + 1), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, raw(now, "other"), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ savedAt: now, version: quiz.version, answers: { q1: "unknown" } }), now)).toBeNull();
  });

  for (const locale of ["en", "zh"] as const) it(`renders every item explanation and both guides at zero or full correct, with stable assessed material: ${locale}`, () => {
    for (const answers of [all, { q1: "b", q2: "a", q3: "a", q4: "b" }]) {
      const result = scoreQuestionnaire(quiz, answers); if (result.status !== "complete" || !("practice" in result)) throw Error("Missing result");
      const html = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect((html.match(/data-practice-explanation/g) ?? [])).toHaveLength(4); expect((html.match(/data-practice-guide=/g) ?? [])).toHaveLength(2);
      for (const question of quiz.questions) expect(html).toContain(question.explanation![locale]);
      expect(html).toContain("JavaScript: typeof 3"); expect(html).not.toContain("data-practice-rank");
    }
  });

  for (const locale of ["en", "zh"] as const) it(`runs the actual shared answer client without premature answers, then review, retake and practice next steps: ${locale}`, async () => {
    // JSDOM omits this native API; real viewport geometry is covered by browser tests.
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    const copy = vi.fn().mockResolvedValue(undefined); vi.stubGlobal("navigator", { clipboard: { writeText: copy } });
    const zh = locale === "zh"; const { container } = render(<QuestionnaireClient quiz={quiz} locale={locale} />);
    expect(screen.getByRole("heading", { name: zh ? "开始4题练习" : "Start your 4-question practice" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: zh ? "开始测试" : "Start test" }));
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(container.querySelector("progress")?.previousElementSibling);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "2 + 2 = ?" }));
    fireEvent.click(screen.getByRole("button", { name: zh ? "下一题" : "Next" })); expect(screen.getByRole("status")).toHaveTextContent(zh ? "请选择" : "Choose an option");
    for (const [i, question] of quiz.questions.entries()) {
      expect(container.querySelector("[data-practice-result]")).toBeNull(); expect(container.querySelector("[data-practice-explanation]")).toBeNull();
      fireEvent.click(container.querySelector(`input[name="${question.id}"][value="${all[question.id as keyof typeof all]}"]`)!);
      fireEvent.click(screen.getByRole("button", { name: i === 3 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next") }));
    }
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "start" });
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.activeElement);
    expect(document.activeElement?.tagName).toBe("H2");
    expect(container.querySelector("[data-practice-correct]")).toHaveTextContent("4 / 4"); expect(container.querySelectorAll("[data-practice-explanation]")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /RIASEC/ })).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec`);
    expect(screen.queryByRole("link", { name: /Explore MBTI|了解MBTI/ })).toBeNull();
    expect(container.querySelectorAll("[data-practice-guide]")).toHaveLength(2);
    expect(vi.mocked(trackEvent).mock.calls.some(([, payload]) => payload?.test_type === "knowledge_practice")).toBe(true);
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toMatch(/"(?:answers|correct|total|score|items|correctOptionId)"/);
    fireEvent.click(screen.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link" }));
    await waitFor(() => expect(copy).toHaveBeenCalledTimes(1));
    const shared = copy.mock.calls[0][0] as string;
    expect(shared).toContain(`https://fermatmind.com/${locale}/tests/explore/practice-contract-fixture`);
    expect(shared).not.toMatch(/q[1-4]|correctOption|4 \/ 4|[?]answers/);
    fireEvent.click(screen.getByRole("button", { name: zh ? "重新测试" : "Retake test" }));
    expect(container.querySelector("[data-practice-result]")).toBeNull(); expect(screen.getAllByRole("radio")[0]).not.toBeChecked();
  });
});
