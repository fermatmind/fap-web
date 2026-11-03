import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/pressure-response-actions.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { recordPressureActions12 } from "@/lib/questionnaires/pressureActions12";
import { PressureActionsPage } from "@/components/questionnaires/PressureActionsPage";
import { pressureLandingSections, pressureLandingFaq } from "@/components/questionnaires/PressureActionsLandingEditorial";
const quiz = raw as Questionnaire;
describe("Trauma observation editorial: categories without points, public reading without personal answers", () => {
  it("verifies the three-statement worked record without a numeric severity total", () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));
    ["2", "2", "na"].forEach((value, i) => { answers[quiz.questions[i].id] = value; });
    const result = recordPressureActions12(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw Error("Expected complete record");
    expect(result.records[0].counts).toEqual({ "0": 0, "1": 0, "2": 2, "3": 0, "4": 0, na: 1 });
    expect(result.records[0].observations.map(o => o.category)).toEqual(["2", "2", "na"]);
    for (const record of result.records) expect(Object.values(record.counts).reduce((a,b) => a+b, 0)).toBe(3);
    expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("risk");
  });
  for (const locale of ["en", "zh"] as const) it(`renders full ${locale} methods, support and source readings without required consent or collapsed reading text`, () => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<PressureActionsPage quiz={quiz} locale={locale} />);
    expect(pressureLandingSections).toHaveLength(8); expect(pressureLandingFaq).toHaveLength(8);
    for (const s of [...pressureLandingSections, ...quiz.guide]) { expect(dom.textContent).toContain(s.title[locale]); for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]); }
    expect(dom.textContent).toContain(quiz.instructions![locale]);
    for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
    expect(dom.querySelectorAll("[data-pressure-actions-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="pressure-actions-library"] ul > li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="pressure-actions-faq"] > div')).toHaveLength(13);
    expect(dom.querySelectorAll("[data-pressure-actions-support]")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector("details p,details section,details article,input[type=checkbox],textarea,input[type=file]" )).toBeNull();
    expect(dom.querySelector("[data-pressure-notes]" )).not.toBeNull();
    expect(dom.querySelector("#pressure-reference-3")).not.toBeNull();
    expect(catalog.find(q => q.slug === quiz.slug)!.description[locale]).toBe(quiz.description[locale]);
  });
});
