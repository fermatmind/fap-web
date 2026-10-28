import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireEmotionDashboardReport, QuestionnaireEmotionDashboardNextSteps } from "@/components/questionnaires/QuestionnaireEmotionDashboardReport";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/eq-dashboard.json", "utf8")) as Questionnaire;
const hash = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const fill = (value: string): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, value]));

describe("original eight-emotion frequency dashboard, without an EQ ability score", () => {
  it("binds40 bilingual contexts, eight five-item groups and eight independently complete guides", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(40); expect(quiz.minimumRatedItems).toBe(3);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["joy", "trust", "fear", "surprise", "sadness", "disgust", "anger", "anticipation"]);
    for (const d of quiz.directions) {
      expect(d.itemCount).toBe(5); expect(quiz.questions.filter(q => q.options[0].directionId === d.id)).toHaveLength(5);
      expect(quiz.profiles.filter(p => p.directionIds.length === 1 && p.directionIds[0] === d.id)).toHaveLength(1);
    }
    for (const q of quiz.questions) {
      expect(q.reverse).toBe(false); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      for (const l of ["en", "zh"] as const) { expect(q.prompt[l]).toBeTruthy(); expect(q.options.every(o => o.label[l])).toBe(true); }
    }
    const paragraphs = quiz.profiles.flatMap(p => p.sections.flatMap(s => s.paragraphs.map(p => p.en)));
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(65); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
      for (const l of ["en", "zh"] as const) for (const s of p.sections) for (const t of s.paragraphs) expect(t[l].trim()).toBeTruthy();
    }
  });
  it("checks every6^5 answer pattern for each group,62208 scoped cases, not6^40 joint enumeration", () => {
    let checked = 0;
    for (const direction of quiz.directions) {
      const questions = quiz.questions.filter(q => q.options[0].directionId === direction.id);
      for (let pattern = 0; pattern < 7776; pattern++) {
        let digits = pattern, sum = 0, rated = 0;
        const answers = fill("na");
        for (const q of questions) {
          const digit = digits % 6; digits = Math.floor(digits / 6);
          answers[q.id] = digit === 5 ? "na" : String(digit + 1);
          if (digit !== 5) { sum += digit + 1; rated++; }
        }
        const result = scoreQuestionnaire(quiz, answers);
        if (result.status !== "complete" || !("facets" in result)) throw new Error("Valid complete pattern rejected");
        const actual = result.facets[direction.id], mean = rated < 3 ? null : Math.round((sum / rated) * 10) / 10;
        if (result.answered !== 40 || actual.sum !== sum || actual.rated !== rated || actual.total !== 5 || actual.mean !== mean) throw new Error(`Wrong scoped mean: ${direction.id}/${pattern}`);
        if (Object.entries(result.facets).some(([id, f]) => id !== direction.id && (f.sum !== 0 || f.rated !== 0 || f.mean !== null))) throw new Error("Cross-emotion score leakage");
        checked++;
      }
    }
    expect(checked).toBe(62208);
  }, 30000);
  it("renders all eight full readings for mixed, endpoint and insufficient states without selecting a winner", () => {
    const samples = [fill("na"), fill("1"), fill("5"), Object.fromEntries(quiz.questions.map((q, i) => [q.id, i < 24 ? ["2", "4", "3"][Math.floor(i / 8)] : "na"]))];
    for (const answers of samples) {
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("facets" in result)) throw new Error("result");
      expect(Object.keys(result).sort()).toEqual(["answered", "facets", "status"]);
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireEmotionDashboardReport quiz={quiz} result={result} answers={answers} locale={locale} />);
        expect(dom.querySelectorAll("[data-emotion-part]")).toHaveLength(8); expect(dom.querySelectorAll("[data-emotion-answer]")).toHaveLength(40);
        expect([...dom.querySelectorAll("[data-emotion-overview-row]")].map(row => row.getAttribute("data-emotion-overview-row"))).toEqual(quiz.directions.map(d => d.id));
        for (const d of quiz.directions) {
          const mean = result.facets[d.id].mean;
          expect(dom.querySelector(`[data-emotion-mean='${d.id}']`)?.textContent).toContain(mean === null ? (locale === "en" ? "Insufficient observations" : "观察不足") : `${mean.toFixed(1)} / 5`);
          const row = dom.querySelector(`[data-emotion-overview-row='${d.id}']`)!;
          expect(row.textContent).toContain(mean === null ? (locale === "en" ? "Insufficient" : "观察不足") : `${mean.toFixed(1)} / 5`);
          expect(row.textContent).toContain(`${result.facets[d.id].rated}/5`);
          expect(row.querySelector("a")?.getAttribute("href")).toBe(`#emotion-title-${d.id}`);
          expect(dom.querySelector(`#emotion-title-${d.id}`)).not.toBeNull();
        }
        for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
        const next = renderToStaticMarkup(<QuestionnaireEmotionDashboardNextSteps locale={locale} />);
        expect(next).toContain(`/${locale}/tests/explore/eq-dashboard#questionnaire-results`); expect(next).not.toContain("/tests/mbti");
      }
    }
    const below = fill("na"); below.ED_JOY_01 = "5"; below.ED_JOY_02 = "5";
    expect(scoreQuestionnaire(quiz, below)).toMatchObject({ status: "complete", facets: { joy: { sum: 10, rated: 2, mean: null } } });
    below.ED_JOY_03 = "1";
    expect(scoreQuestionnaire(quiz, below)).toMatchObject({ status: "complete", facets: { joy: { sum: 11, rated: 3, mean: 3.7 } } });
  });
  it("withholds incomplete inputs and rejects invalid options, unknown fields and malformed group configuration", () => {
    const all = fill("3"), partial = { ...all }; delete partial.ED_ANTICIPATION_05;
    expect(scoreQuestionnaire(quiz, partial)).toMatchObject({ status: "incomplete", answered: 39 });
    for (const input of [null, [], "eq", { ...all, ED_JOY_01: "0" }, { ...all, ED_JOY_01: 3 }, { ...all, unknown: "3" }]) expect(scoreQuestionnaire(quiz, input).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.minimumRatedItems = 6; }, (q: Questionnaire) => { q.directions[0].itemCount = 4; }, (q: Questionnaire) => { q.questions[0].options[0].score = 0; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }, (q: Questionnaire) => { q.questions[1].id = q.questions[0].id; }]) {
      const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, all).status).toBe("unavailable");
    }
  });
  it("restores only valid current-edition drafts, without turning partial observations into a result", () => {
    const now = 1_793_200_000_000, answers = { ED_JOY_01: "na", ED_TRUST_01: "4" };
    const raw = (version: string, savedAt: number) => JSON.stringify({ answers, version, savedAt });
    expect(readQuestionnaireDraft(quiz, raw(quiz.version, now), now)).toEqual(answers); expect(scoreQuestionnaire(quiz, answers).status).toBe("incomplete");
    for (const input of [raw("other", now), raw(quiz.version, now + 1), raw(quiz.version, now - 86400000), "bad", JSON.stringify({ answers: { ED_JOY_01: "6" }, version: quiz.version, savedAt: now })]) expect(readQuestionnaireDraft(quiz, input, now)).toBeNull();
  });
});
