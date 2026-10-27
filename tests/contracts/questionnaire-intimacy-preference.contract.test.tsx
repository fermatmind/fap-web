import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/intimacy-preference-test.json";
import source from "@/tests/fixtures/questionnaires/intimacy-preference-source-reference.json";
import frozenProfiles from "@/tests/fixtures/questionnaires/intimacy-preference-profiles-reference.json";
import numbers from "@/tests/fixtures/questionnaires/intimacy-preference-numeric-reference.json";
import { isMiniIntimacyConfigurationValid, scoreMiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";
import { QuestionnaireIntimacyReport } from "@/components/questionnaires/QuestionnaireIntimacyReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { MiniIntimacyQuestionnaire } from "@/lib/questionnaires/miniIntimacy";

const quiz = data as unknown as MiniIntimacyQuestionnaire;
const base = () => Object.fromEntries(data.questions.map(q => [q.id, "3"]));
const complete = (answers: unknown) => {
  const result = scoreMiniIntimacyQuestionnaire(quiz, answers);
  expect(result.status).toBe("complete");
  if (result.status !== "complete") throw new Error("Expected a complete synthetic response");
  return result;
};

describe("original INTIMACY_PREFERENCE migration", () => {
  it("preserves every source item, five numeric anchors, group and full bilingual manuscript", () => {
    expect(isMiniIntimacyConfigurationValid(data)).toBe(true);
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
    expect(data.guide.flatMap(s => s.paragraphs).map(p => p.en).join(" ")).toContain("original Mini requires all 24 numeric responses");
  });

  it("matches every possible group sum against the independent Decimal reference", () => {
    let checked = 0;
    for (const expected of numbers.rows) for (let group = 0; group < 4; group++) {
      const answers = base(); let remainder = expected.sum - 6;
      for (let i = 0; i < 6; i++) { const extra = Math.min(remainder, 4); remainder -= extra; answers[data.questions[group * 6 + i].id] = String(1 + extra); }
      const result = complete(answers), part = result.facets[data.directions[group].id];
      expect(part).toEqual({ sum: expected.sum, rated: 6, total: 6, mean: expected.mean });
      expect(part.mean!.toFixed(4)).toBe(expected.display_mean);
      expect(Object.keys(result)).toEqual(["status", "answered", "facets"]); checked++;
    }
    expect(checked).toBe(100);
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
    for (let length = 0; length < 24; length++) expect(scoreMiniIntimacyQuestionnaire(quiz, Object.fromEntries(Object.entries(base()).slice(0, length))).status).toBe("incomplete");
    for (const bad of [null, undefined, [], true, 3, "", new Date(), { ...base(), extra: "3" }, ...["0", "6", "2.5", "skip", 3, true, null, NaN, Infinity].map(value => ({ ...base(), [data.questions[0].id]: value }))]) expect(scoreMiniIntimacyQuestionnaire(quiz, bad).status).toBe("invalid");
    const getter = base(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get: () => { throw new Error("must not invoke"); } });
    expect(scoreMiniIntimacyQuestionnaire(quiz, getter).status).toBe("invalid");
    expect(scoreMiniIntimacyQuestionnaire(quiz, Object.assign(Object.create(null), base())).status).toBe("complete");
    for (const mutate of [
      (q: typeof data) => { q.minimumRatedItems = 1; },
      (q: typeof data) => { q.resultHeading.en = ""; },
      (q: typeof data) => { q.title.zh = ""; },
      (q: typeof data) => { delete q.questions[2]; },
      (q: typeof data) => { delete q.profiles[1].sections[4].paragraphs[0]; },
      (q: typeof data) => { q.questions[0].options[2].score = 0; },
      (q: typeof data) => { q.questions[0].options[5].score = 3; },
      (q: typeof data) => { q.questions[0].reverse = true; },
      (q: typeof data) => { q.profiles[0].sections[1].id = q.profiles[0].sections[0].id; },
    ]) {
      const broken = structuredClone(data); mutate(broken);
      expect(isMiniIntimacyConfigurationValid(broken)).toBe(false);
      expect(scoreMiniIntimacyQuestionnaire(broken as unknown as Questionnaire, base()).status).toBe("unavailable");
    }
  });

  it("renders all four full manuscripts with complete, part-NA and all-NA responses in both locales", () => {
    const attempts = [base(), { ...base(), [data.questions[0].id]: "na" }, Object.fromEntries(data.questions.map(q => [q.id, "na"]))];
    for (const locale of ["en", "zh"] as const) for (const answers of attempts) {
      const result = complete(answers);
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireIntimacyReport quiz={quiz} result={result} locale={locale} />), "text/html");
      let paragraphs = 0;
      expect(doc.querySelectorAll("[data-intimacy-part]")).toHaveLength(4);
      for (const profile of data.profiles) {
        const part = doc.querySelector(`[data-intimacy-part="${profile.directionIds[0]}"]`)!;
        expect(part.querySelector("h3")?.textContent).toBe(data.directions.find(d => d.id === profile.directionIds[0])!.title[locale]);
        for (const section of profile.sections) {
          const node = part.querySelector(`[id="intimacy-report-${profile.id}-${section.id}"]`)!;
          expect(node.querySelector("h4")?.textContent).toBe(section.title[locale]);
          expect([...node.querySelectorAll(":scope > ul > li, :scope > p")].map(p => p.textContent)).toEqual(section.paragraphs.map(p => p[locale]));
          paragraphs += section.paragraphs.length;
        }
        const mean = result.facets[profile.directionIds[0]].mean, text = part.querySelector("[data-intimacy-mean]")!.textContent!;
        if (mean === null) expect(text).toContain(locale === "zh" ? "资料不足" : "Insufficient information"); else expect(text).toContain(mean.toFixed(4) + " / 5");
        expect(part.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/tests/explore/intimacy-preference-test/results/${profile.id}`);
      }
      expect(paragraphs).toBe(64);
      const ids = [...doc.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      for (const element of doc.querySelectorAll("[aria-labelledby]")) for (const id of element.getAttribute("aria-labelledby")!.split(" ")) expect(doc.getElementById(id)).not.toBeNull();
      expect(doc.querySelectorAll("form, input, script")).toHaveLength(0);
      expect(doc.querySelector("[data-intimacy-next-steps]")!.textContent).not.toContain("MBTI");
    }
  });
});
