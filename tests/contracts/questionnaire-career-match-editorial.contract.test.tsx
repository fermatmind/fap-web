import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareerMatchPage } from "@/components/questionnaires/CareerMatchPage";
import { careerThemesLandingSections, careerThemesLandingFaq } from "@/components/questionnaires/CareerThemesLandingEditorial";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import type { Questionnaire } from "@/lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/career-match.json", "utf8")) as Questionnaire;
describe("career-theme comparison editorial parity", () => {
  it.each(["en", "zh"] as const)("%s: renders all original and bespoke explanations with a direct tool entry", locale => {
    expect(isCareerMatchConfigurationValid(quiz)).toBe(true);
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<CareerMatchPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("main")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro #take-test[data-stage=welcome] > button")?.textContent).toBe(locale === "en" ? "Start comparison" : "开始比较");
    expect(dom.querySelector("#take-test input[required]")).toBeNull();
    expect(dom.querySelector("[data-entertainment-activity-opt-in]")?.textContent).toContain(locale === "en" ? "Optional" : "可选");
    for (const s of [...quiz.guide, ...careerThemesLandingSections]) {
      expect(dom.textContent).toContain(s.title[locale]);
      for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...careerThemesLandingFaq]) {
      expect(dom.textContent).toContain(f.question[locale]); expect(dom.textContent).toContain(f.answer[locale]);
    }
    expect(careerThemesLandingSections).toHaveLength(8); expect(careerThemesLandingFaq).toHaveLength(8);
    expect(dom.querySelectorAll('a[href*="/career-match/results/"]')).toHaveLength(0);
    expect(dom.querySelectorAll(".explore-reading-library > section")).toHaveLength(7);
  });
});
