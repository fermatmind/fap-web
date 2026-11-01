import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/8-values-political.json";
import reference from "@/tests/fixtures/questionnaires/8-values-political-reference.json";
import content from "@/lib/questionnaires/result-content/8-values-political.json";
import { eightValuesResultProfile } from "@/lib/questionnaires/result-content/8-values-political";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireEightValuesReport } from "@/components/questionnaires/QuestionnaireEightValuesReport";
import { scoreEightValuesQuestionnaire } from "@/lib/questionnaires/eightValues";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const neutral = Object.fromEntries(quiz.questions.map(q => [q.id, "3"]));

describe("Eight bilingual 8 Values pole readings", () => {
  it("retains every source section and paragraph with distinct arithmetic and discussion examples", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const prepared = eightValuesResultProfile(profile);
      expect(prepared.sections.map(s => s.id)).toEqual(profile.sections.map(s => s.id));
      expect(prepared.title).toEqual(profile.title);
      expect(prepared.directionIds).toEqual(profile.directionIds);
      expect(prepared.scoreReading).toEqual(profile.scoreReading);
      for (const section of profile.sections) expect(prepared.sections.find(s => s.id === section.id)!.paragraphs.slice(0, section.paragraphs.length)).toEqual(section.paragraphs);
      expect(prepared.sections.flatMap(s => s.paragraphs)).toHaveLength(11);
    }
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(Object.values(content).map(s => s[0].paragraphs[0][locale])).size).toBe(8);
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(8);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(eightValuesResultProfile(unknown)).toBe(unknown);
  });
  it("checks every newly described neutral-plus-one-response calculation, including cross-axis effects", () => {
    const cases = [
      ["E8_006", "4", "econ", 2.5, 195, 50.6, 49.4],
      ["E8_003", "4", "econ", -5, 195, 48.7, 51.3],
      ["E8_019", "5", "dipl", -10, 225, 47.8, 52.2],
      ["E8_026", "4", "dipl", 5, 225, 51.1, 48.9],
      ["E8_026", "4", "scty", 5, 292, 50.9, 49.1],
      ["E8_038", "4", "govt", 5, 320, 50.8, 49.2],
      ["E8_038", "4", "scty", 2.5, 292, 50.4, 49.6],
      ["E8_035", "4", "govt", -5, 320, 49.2, 50.8],
      ["E8_055", "5", "scty", 2, 292, 50.3, 49.7],
      ["E8_055", "5", "govt", 10, 320, 51.6, 48.4],
      ["E8_055", "2", "scty", -1, 292, 49.8, 50.2],
      ["E8_055", "2", "govt", -5, 320, 49.2, 50.8],
    ] as const;
    for (const [question, response, axis, sum, maximum, percentage, complement] of cases) {
      const result = scoreEightValuesQuestionnaire(quiz, { ...neutral, [question]: response });
      if (result.status !== "complete") throw Error("Complete single-item illustration required");
      expect(result.eightValuesAxes[axis]).toEqual({ sum, maximum, percentage, complement });
    }
  });
  it.each(["zh", "en"] as const)("renders all eight complete public %s guides without personal scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-eight-values-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-eight-values-axis]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("preserves all 875 source vectors and all eight full guides in %s reports", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (const witness of reference.sourceWitnesses) {
      const result = scoreEightValuesQuestionnaire(prepared, witness.answers);
      expect(result).toEqual(scoreEightValuesQuestionnaire(quiz, witness.answers));
      if (result.status !== "complete") throw Error("Complete source witness required");
      expect(result.eightValuesAxes).toEqual(witness.axes);
      if (!(witness.name === "all-3" || witness.name.endsWith("maximum") || witness.name.endsWith("minimum"))) continue;
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireEightValuesReport quiz={prepared} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-eight-values-axis]")).toHaveLength(4);
      expect(root.querySelectorAll("[data-eight-values-result-reading]")).toHaveLength(8);
      expect(root.querySelectorAll("h4")).toHaveLength(56);
      for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#eight-values-report-${profile.id}-${section.id}`)?.textContent).toContain(paragraph[locale]);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#eight-values-report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
