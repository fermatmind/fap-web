import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/problem-solving-critical-thinking.json";
import content from "@/lib/questionnaires/result-content/problem-solving-critical-thinking.json";
import { problemSolvingResultProfile } from "@/lib/questionnaires/result-content/problem-solving-critical-thinking";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Three bilingual problem-solving-critical-thinking revision readings", () => {
  it("preserves the actual source guides and provides distinct bilingual review examples", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = problemSolvingResultProfile(p);
      expect(prepared.sections.slice(0, 8)).toEqual(p.sections);
      expect(prepared.sections).toHaveLength(10);
      expect(new Set(prepared.sections.map(s => s.id)).size).toBe(10);
    }
    for (const locale of ["en", "zh"] as const)
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(3);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(problemSolvingResultProfile(unknown)).toBe(unknown);
  });
  it("clarifies the shuffled plan references while preserving every task and answer key", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions.filter((q, i) => q !== quiz.questions[i]).map(q => q.id)).toEqual(["PROBLEM_15"]);
    expect(prepared.questions[14].explanation!.en).toContain("Option B totals 55");
    expect(prepared.questions[14].explanation!.en).toContain("Option A totals 65");
    expect(prepared.questions[14].explanation!.zh).toContain("B方案总55");
    expect(prepared.questions[14].explanation!.zh).toContain("A方案65");
    expect(prepared.questions.map(q => ({ ...q, explanation: undefined }))).toEqual(quiz.questions.map(q => ({ ...q, explanation: undefined })));
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it.each(["zh", "en"] as const)("renders each public %s guide without personal answers or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-problem-solving-critical-thinking-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-practice-correct], [data-practice-question]")).toBeNull();
      for (const s of problemSolvingResultProfile(p).sections) for (const text of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps all explanations and guides at zero, mixed and perfect %s counts", locale => {
    for (const mode of ["zero", "mixed", "perfect"]) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, mode === "perfect" || (mode === "mixed" && i % 2 === 0) ? q.correctOptionId! : q.options.find(o => o.id !== q.correctOptionId)!.id]));
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw new Error("Complete practice witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-practice-question]")).toHaveLength(30);
      expect(root.querySelectorAll("[data-practice-explanation]")).toHaveLength(30);
      expect(root.querySelectorAll("[data-problem-solving-critical-thinking-result-reading]")).toHaveLength(3);
      expect(root.querySelectorAll("h4")).toHaveLength(60);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#practice-guide-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const p of quiz.profiles) for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(root.querySelector(`#practice-guide-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
});
