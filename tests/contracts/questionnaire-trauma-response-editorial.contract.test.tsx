import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/trauma-response-reflection.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { recordTraumaResponse20 } from "@/lib/questionnaires/traumaResponse20";
import { TraumaResponsePage } from "@/components/questionnaires/TraumaResponsePage";
import { traumaLandingSections, traumaLandingFaq } from "@/components/questionnaires/TraumaResponseLandingEditorial";
const quiz = raw as Questionnaire;
describe("Trauma observation editorial: categories without points, public reading without personal answers", () => {
  it("verifies the five-statement worked record without a numeric severity total", () => {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));
    ["0", "2", "2", "4", "na"].forEach((value, i) => { answers[quiz.questions[i].id] = value; });
    const result = recordTraumaResponse20(quiz, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw Error("Expected complete record");
    expect(result.records[0].counts).toEqual({ "0": 1, "1": 0, "2": 2, "3": 0, "4": 1, na: 1 });
    expect(result.records[0].observations.map(o => o.category)).toEqual(["0", "2", "2", "4", "na"]);
    for (const record of result.records) expect(Object.values(record.counts).reduce((a,b) => a+b, 0)).toBe(5);
    expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("risk");
  });
  for (const locale of ["en", "zh"] as const) it(`renders full ${locale} methods, support and source readings without required consent or collapsed reading text`, () => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<TraumaResponsePage quiz={quiz} locale={locale} />);
    expect(traumaLandingSections).toHaveLength(8); expect(traumaLandingFaq).toHaveLength(8);
    for (const s of [...traumaLandingSections, ...quiz.guide]) { expect(dom.textContent).toContain(s.title[locale]); for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]); }
    expect(dom.textContent).toContain(quiz.instructions![locale]);
    for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
    expect(dom.querySelectorAll("[data-trauma-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="trauma-library"] ul > li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="trauma-faq"] > div')).toHaveLength(12);
    expect(dom.querySelectorAll("[data-trauma-support]")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector("details p,details section,details article,input[type=checkbox],textarea,input[type=file]" )).toBeNull();
    expect(dom.querySelector("[data-trauma-reading-art]" )).not.toBeNull();
    expect(dom.querySelector("#trauma-reference-4")).not.toBeNull();
    expect(catalog.find(q => q.slug === quiz.slug)!.description[locale]).toBe(quiz.description[locale]);
  });
});
