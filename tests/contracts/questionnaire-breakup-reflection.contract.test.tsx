import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/breakup-reflection-test.json";
import source from "@/tests/fixtures/questionnaires/breakup-reflection-source-reference.json";
import frozenProfiles from "@/tests/fixtures/questionnaires/breakup-reflection-profiles-reference.json";
import numbers from "@/tests/fixtures/questionnaires/breakup-reflection-numeric-reference.json";
import { isMiniBreakupConfigurationValid, scoreMiniBreakupQuestionnaire } from "@/lib/questionnaires/miniBreakup";
import { QuestionnaireBreakupReviewReport, QuestionnaireBreakupReviewNextSteps } from "@/components/questionnaires/QuestionnaireBreakupReviewReport";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = data as unknown as Questionnaire;
const base = () => Object.fromEntries(data.questions.map(q => [q.id, "3"]));
const complete = (answers: unknown) => {
  const result = scoreMiniBreakupQuestionnaire(quiz, answers);
  expect(result.status).toBe("complete");
  if (result.status !== "complete") throw new Error("Expected a complete synthetic response");
  return result;
};

describe("original BREAKUP_REASON migration", () => {
  it("preserves every source item, five numeric anchors, group and full bilingual manuscript", () => {
    expect(isMiniBreakupConfigurationValid(data)).toBe(true);
    expect(data.source).toEqual(source.candidate_source);
    expect(data.profiles).toEqual(frozenProfiles);
    const groups = new Map(source.source_scoring_spec.factors.map((f, i) => [f.factor_code, data.directions[i].id]));
    for (const [i, original] of source.items.entries()) {
      const question = data.questions[i];
      expect(question.id).toBe(original.source_id);
      expect(question.prompt).toEqual(original.prompt);
      expect(question.reverse).toBe(false);
      expect(question.options.map(o => o.directionId)).toEqual(Array(6).fill(groups.get(original.factor_code)));
      expect(question.options.slice(0, 5).map(o => o.label)).toEqual(Object.values(source.numeric_labels));
      expect(question.options.at(-1)).toMatchObject({ id: "na", label: source.NA_addition, score: null });
    }
    expect(data.description.en.length).toBe(158);
    expect(data.guide.flatMap(s => s.paragraphs).map(p => p.en).join(" ")).toContain("original miniature-program scorer suppresses personal interpretation");
  });

  it("recomputes all 62500 marginal response vectors against the independent Decimal reference", () => {
    const oracle = new Map(numbers.rows.map(r => [r.sum, r]));
    let checked = 0;
    for (let group = 0; group < 4; group++) for (let vector = 0; vector < 15625; vector++) {
      const answers = base(); let n = vector, sum = 0;
      for (let i = 0; i < 6; i++) { const value = n % 5 + 1; n = Math.floor(n / 5); sum += value; answers[data.questions[group * 6 + i].id] = String(value); }
      const result = scoreMiniBreakupQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("A valid source vector failed");
      const part = result.facets[data.directions[group].id], expected = oracle.get(sum)!;
      if (part.sum !== sum || part.rated !== 6 || part.total !== 6 || part.mean !== expected.mean || part.mean.toFixed(4) !== expected.display_mean) throw new Error(`Independent arithmetic mismatch at group ${group}, vector ${vector}`);
      if ("total" in result || "profileIds" in result) throw new Error("An overall score or assigned type appeared");
      checked++;
    }
    expect(checked).toBe(62500); // Four marginal 5^6 enumerations, not 5^24 joint coverage.
  });

  it("keeps the numeric uncertain midpoint distinct from 252 nonempty group skip masks", () => {
    expect(Object.values(complete(base()).facets).map(f => f.mean)).toEqual([3, 3, 3, 3]);
    for (let group = 0; group < 4; group++) for (let mask = 1; mask < 64; mask++) {
      const answers = base(); let skipped = 0;
      for (let i = 0; i < 6; i++) if (mask & (1 << i)) { answers[data.questions[group * 6 + i].id] = "na"; skipped++; }
      const result = complete(answers);
      expect(result.facets[data.directions[group].id]).toMatchObject({ rated: 6 - skipped, mean: null });
      data.directions.forEach((d, i) => { if (i !== group) expect(result.facets[d.id].mean).toBe(3); });
    }
    expect(Object.values(complete(Object.fromEntries(data.questions.map(q => [q.id, "na"]))).facets).every(f => f.mean === null)).toBe(true);
  });

  it("distinguishes incomplete, invalid and unavailable without invoking answer getters", () => {
    for (let length = 0; length < 24; length++) expect(scoreMiniBreakupQuestionnaire(quiz, Object.fromEntries(Object.entries(base()).slice(0, length))).status).toBe("incomplete");
    for (const bad of [null, undefined, [], true, 3, "", new Date(), { ...base(), extra: "3" }, ...["0", "6", "2.5", "skip", 3, true, null, NaN, Infinity].map(value => ({ ...base(), [data.questions[0].id]: value }))]) expect(scoreMiniBreakupQuestionnaire(quiz, bad).status).toBe("invalid");
    const getter = base(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get: () => { throw new Error("must not invoke"); } });
    expect(scoreMiniBreakupQuestionnaire(quiz, getter).status).toBe("invalid");
    expect(scoreMiniBreakupQuestionnaire(quiz, Object.assign(Object.create(null), base())).status).toBe("complete");
    for (const mutate of [
      (q: typeof data) => { q.minimumRatedItems = 1; },
      (q: typeof data) => { q.questions[0].options[2].score = 0; },
      (q: typeof data) => { q.questions[0].options[5].score = 3; },
      (q: typeof data) => { q.questions[0].reverse = true; },
      (q: typeof data) => { q.profiles[0].sections[1].id = q.profiles[0].sections[0].id; },
    ]) {
      const broken = structuredClone(data); mutate(broken);
      expect(isMiniBreakupConfigurationValid(broken)).toBe(false);
      expect(scoreMiniBreakupQuestionnaire(broken as unknown as Questionnaire, base()).status).toBe("unavailable");
    }
  });

  it("renders all four full manuscripts with complete, part-NA and all-NA responses in both locales", () => {
    const attempts = [base(), { ...base(), [data.questions[0].id]: "na" }, Object.fromEntries(data.questions.map(q => [q.id, "na"]))];
    for (const locale of ["en", "zh"] as const) for (const answers of attempts) {
      const result = complete(answers);
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<><QuestionnaireBreakupReviewReport quiz={quiz} result={result} locale={locale} /><QuestionnaireBreakupReviewNextSteps result={result} locale={locale} /></>), "text/html");
      let paragraphs = 0;
      expect(doc.querySelectorAll("[data-breakup-review-part]")).toHaveLength(4);
      for (const profile of data.profiles) {
        const part = doc.querySelector(`[data-breakup-review-part="${profile.directionIds[0]}"]`)!;
        expect(part.querySelector("h3")?.textContent).toBe(data.directions.find(d => d.id === profile.directionIds[0])!.title[locale]);
        for (const section of profile.sections) {
          const node = part.querySelector(`[id="breakup-review-report-${profile.id}-${section.id}"]`)!;
          expect(node.querySelector("h4")?.textContent).toBe(section.title[locale]);
          expect([...node.querySelectorAll(":scope > ul > li, :scope > p")].map(p => p.textContent)).toEqual(section.paragraphs.map(p => p[locale]));
          paragraphs += section.paragraphs.length;
        }
        const mean = result.facets[profile.directionIds[0]].mean, text = part.querySelector("[data-breakup-review-mean]")!.textContent!;
        if (mean === null) expect(text).toContain(locale === "zh" ? "资料不足" : "Insufficient information"); else expect(text).toContain(mean.toFixed(4) + " / 5");
        expect(part.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/tests/explore/breakup-reflection-test/results/${profile.id}`);
      }
      expect(paragraphs).toBe(64);
      const ids = [...doc.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      for (const element of doc.querySelectorAll("[aria-labelledby]")) for (const id of element.getAttribute("aria-labelledby")!.split(" ")) expect(doc.getElementById(id)).not.toBeNull();
      expect(doc.querySelectorAll("form, input, script")).toHaveLength(0);
      expect(doc.querySelector("[data-breakup-review-next-steps]")!.textContent).not.toContain("MBTI");
    }
  });
});
