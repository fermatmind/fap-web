import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/learning-style.json";
import content from "@/lib/questionnaires/result-content/learning-preference.json";
import { learningPreferenceResultProfile } from "@/lib/questionnaires/result-content/learning-preference";
import { QuestionnaireLearningPreferenceReport } from "@/components/questionnaires/QuestionnaireLearningPreferenceReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Current learning-format preference result readings", () => {
  it("preserves every source section, facet identity and scoring description", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = learningPreferenceResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(12);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(12);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(learningPreferenceResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders four public %s guides without means or attempt data", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector("[data-learning-preference-result-reading]")).not.toBeNull();
      expect(root.querySelector("[data-learning-mean], [data-learning-facet]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) {
        for (const p of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      }
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("keeps mixed, low, equal and insufficient %s facets separate with all four readings", locale => {
    for (const mode of ["mixed", "low", "equal", "insufficient"] as const) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, mode === "insufficient" || (mode === "mixed" && q.options[0].directionId !== "visual") ? "na" : String(q.reverse ? 6 - (mode === "low" ? 1 : 3) : mode === "low" ? 1 : 3)]));
      const result = scoreLikertQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete source-based attempt required");
      for (const [id, facet] of Object.entries(result.facets)) expect(facet.mean).toBe(mode === "insufficient" || (mode === "mixed" && id !== "visual") ? null : mode === "low" ? 1 : 3);
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireLearningPreferenceReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-learning-preference-result-reading]")).toHaveLength(4);
      expect(root.querySelectorAll("[data-learning-mean]")).toHaveLength(4);
      expect(root.querySelectorAll("[data-learning-insufficient]")).toHaveLength(mode === "insufficient" ? 1 : 0);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs) expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
