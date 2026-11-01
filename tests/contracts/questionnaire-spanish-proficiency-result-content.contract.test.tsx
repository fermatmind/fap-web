import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/spanish-proficiency.json";
import content from "@/lib/questionnaires/result-content/spanish-proficiency.json";
import { spanishProficiencyResultProfile } from "@/lib/questionnaires/result-content/spanish-proficiency";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Four Spanish revision readings", () => {
  it("preserves the actual source guides and provides distinct bilingual review examples", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = spanishProficiencyResultProfile(p);
      expect(prepared.sections.slice(0, 5)).toEqual(p.sections);
      expect(prepared.sections).toHaveLength(8);
      expect(new Set(prepared.sections.map(s => s.id)).size).toBe(8);
    }
    for (const locale of ["en", "zh"] as const)
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(4);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(spanishProficiencyResultProfile(unknown)).toBe(unknown);
  });
  it("corrects the named distractor without changing the source key or Spanish stimulus", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions[7].explanation!.en).toContain("Option C adds a condition");
    expect(prepared.questions[7].explanation!.zh).toContain("C项增加了");
    expect(quiz.questions[7].explanation!.en).toContain("The final alternative adds a condition");
    expect(quiz.questions[7].explanation!.zh).toContain("最后一项增加了");
    expect(prepared.questions.map(q => ({ ...q, explanation: undefined }))).toEqual(quiz.questions.map(q => ({ ...q, explanation: undefined })));
    expect(prepared.questions.filter(q => q.id !== "SPANISH_08")).toEqual(quiz.questions.filter(q => q.id !== "SPANISH_08"));
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it.each(["zh", "en"] as const)("renders each public %s guide without personal answers or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-spanish-proficiency-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-practice-correct], [data-practice-question]")).toBeNull();
      for (const s of spanishProficiencyResultProfile(p).sections) for (const text of s.paragraphs)
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
      expect(root.querySelectorAll("[data-practice-question]")).toHaveLength(24);
      expect(root.querySelectorAll("[data-practice-explanation]")).toHaveLength(24);
      expect(root.querySelectorAll("[data-spanish-proficiency-result-reading]")).toHaveLength(4);
      expect(root.querySelectorAll("h4")).toHaveLength(56);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#practice-guide-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const p of quiz.profiles) for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(root.querySelector(`#practice-guide-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
});
