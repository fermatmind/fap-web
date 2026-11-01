import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/eras-of-you-test.json";
import content from "@/lib/questionnaires/result-content/eras-of-you-test.json";
import { erasOfYouResultProfile } from "@/lib/questionnaires/result-content/eras-of-you-test";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireChapterReport } from "@/components/questionnaires/QuestionnaireChapterReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Six current-practice reviews and conversations", () => {
  it("preserves original paragraphs, nine-section counts and the source bank while preparing only this edition", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(Object.keys(content)).toEqual(quiz.profiles.map(p => p.id));
    for (const p of quiz.profiles) {
      const reading = erasOfYouResultProfile(p);
      expect(reading.sections).toHaveLength(9);
      expect(reading.sections.map(s => ({ ...s, paragraphs: s.paragraphs.slice(0, 1) }))).toEqual(p.sections);
      expect(reading.directionIds).toEqual(p.directionIds);
    }
    for (const locale of ["zh", "en"] as const) for (const index of [0, 1]) expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(6);
    expect(prepared.questions).toBe(quiz.questions); expect(prepared.guide).toBe(quiz.guide);
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(erasOfYouResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders each complete public %s guide without personal means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-eras-of-you-test-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-facet-score]")).toBeNull();
      for (const s of erasOfYouResultProfile(p).sections) for (const text of s.paragraphs) expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps independent means and all four full %s readings across the rated-item threshold", locale => {
    for (const mode of ["low", "high", "equal", "allNA", "twoRated", "threeRated", "rounded"]) {
      const choices = quiz.questions.map(q => {
        const index = quiz.questions.filter(x => x.options[0].directionId === q.options[0].directionId).findIndex(x => x.id === q.id);
        return mode === "allNA" || (mode === "twoRated" && index >= 2) || (mode === "threeRated" && index >= 3) || (mode === "rounded" && index === 4) ? "na" : mode === "low" ? "1" : mode === "high" ? "5" : mode === "rounded" ? ["4", "5", "4", "4"][index] : "3";
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, choices[i]])));
      if (result.status !== "complete") throw new Error("Complete expression witness required");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireChapterReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-eras-of-you-test-result-reading]")).toHaveLength(6);
      expect(root.querySelectorAll("h4")).toHaveLength(54);
      for (const d of quiz.directions) {
        const part = choices.filter((_, i) => quiz.questions[i].options[0].directionId === d.id).filter(v => v !== "na").map(Number);
        const mean = part.length >= 3 ? Math.round(part.reduce((a, b) => a + b, 0) / part.length * 10) / 10 : null;
        expect(result.facets[d.id]).toMatchObject({ rated: part.length, mean });
        const text = root.querySelector(`[data-facet-score="${d.id}"]`)?.textContent;
        expect(text).toContain(mean === null ? locale === "zh" ? "资料不足" : "Insufficient information" : `${mean.toFixed(1)} / 5`);
      }
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const p of quiz.profiles) for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs) expect(root.querySelector(`#report-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("percentile");
    }
  });
});
