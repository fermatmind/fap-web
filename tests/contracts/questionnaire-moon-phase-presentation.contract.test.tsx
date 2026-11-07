import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import raw from "@/lib/questionnaires/data/moon-phase.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { MoonPhaseReveal } from "@/components/questionnaires/MoonPhaseReveal";
import { moonPhasePresentations, moonPhaseImage, moonPhasePresentation } from "@/lib/questionnaires/moonPhasePresentation";

const quiz = raw as Questionnaire;
describe("moon phase visual result boundary", () => {
  it("covers exactly the existing identities with eight distinct original diagrams and safe unknown handling", () => {
    expect(Object.keys(moonPhasePresentations)).toEqual(quiz.profiles.map(p => p.id));
    const images = quiz.profiles.map(p => readFileSync(`public${moonPhaseImage(p.id)}`, "utf8"));
    expect(new Set(images).size).toBe(8);
    expect(moonPhasePresentation("__proto__")).toBeUndefined();
    expect(moonPhasePresentation("unknown")).toBeUndefined();
  });
  it.each(["en", "zh"] as const)("reveals every highest tie in %s with reasons derived only from selected options", locale => {
    for (const target of [...quiz.profiles.map(p => p.id), "tie"]) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, (target === "tie" ? q.options[0] : q.options.find(o => o.directionId === target) ?? q.options[0]).id]));
      const result = scoreArchetypeQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete witness rejected");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<MoonPhaseReveal quiz={quiz} result={result} answers={answers} locale={locale} />);
      expect(root.querySelectorAll("[data-moon-phase-reveal] > ul > li")).toHaveLength(result.profileIds.length);
      for (const id of result.profileIds) {
        expect(root.querySelector(`img[src="${moonPhaseImage(id)}"]`)).not.toBeNull();
        const profile = quiz.profiles.find(p => p.id === id)!;
        const chosen = quiz.questions.flatMap(q => q.options.filter(o => o.id === answers[q.id] && profile.directionIds.includes(o.directionId))).slice(0, 2);
        for (const option of chosen) expect(root.querySelector("[data-moon-phase-reveal]")?.textContent).toContain(option.label[locale]);
        expect(root.querySelector(`a[href="/${locale}/tests/explore/moon-phase/results/${id}"]`)).not.toBeNull();
      }
      const noAnswers = renderToStaticMarkup(<MoonPhaseReveal quiz={quiz} result={result} locale={locale} />);
      expect(noAnswers).not.toContain("data-moon-phase-choice-reasons");
      expect(root.querySelector("[data-moon-phase-sharing]")?.textContent).toContain(locale === "zh" ? "不含答案或次数" : "without answers or counts");
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
