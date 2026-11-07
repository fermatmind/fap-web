import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import raw from "@/lib/questionnaires/data/moon-phase.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { MoonPhaseComparison } from "@/components/questionnaires/MoonPhaseComparison";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
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
  it.each(["en", "zh"] as const)("uses the visible directory override for the %s moon phase card", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
    const link = root.querySelector(`h4 a[href="/${locale}/tests/explore/moon-phase"]`)!;
    const copy = link.closest("article")!.querySelector(".catalog-item-body > p")!.textContent!;
    expect(copy).toContain(locale === "zh" ? "24题" : "24 questions");
    expect(copy).toContain(locale === "zh" ? "全部最高并列" : "every top match");
    expect(copy).toContain(locale === "zh" ? "八份指南" : "eight full guides");
  });
  it.each(["en", "zh"] as const)("orders all eight public %s comparisons and keeps tied full readings optional", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<MoonPhaseComparison locale={locale} />);
    expect([...root.querySelectorAll("[data-moon-phase-comparison-id]")].map(el => el.getAttribute("data-moon-phase-comparison-id"))).toEqual(quiz.profiles.map(p => p.id));
    for (const profile of quiz.profiles) expect(root.querySelector(`a[href="/${locale}/tests/explore/moon-phase/results/${profile.id}"]`)).not.toBeNull();
    const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, "A"])));
    if (result.status !== "complete") throw new Error("Complete tie rejected");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={result} locale={locale} />);
    expect(root.querySelectorAll("[data-moon-phase-top-overview] > li")).toHaveLength(8);
    expect(root.querySelectorAll("[data-moon-phase-full-reading]")).toHaveLength(8);
    expect(root.querySelectorAll("[data-moon-phase-full-reading][open]")).toHaveLength(0);
    expect(root.querySelectorAll("[data-archetype-match] h4")).toHaveLength(72);
    expect(root.querySelectorAll("[data-moon-phase-comparison-id]")).toHaveLength(8);
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
