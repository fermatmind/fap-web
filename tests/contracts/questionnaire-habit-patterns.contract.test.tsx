import React from "react";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/habit-patterns-test.json";
import source from "@/tests/fixtures/questionnaires/habit-patterns-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/habit-patterns-profiles-reference.json";
import numbers from "@/tests/fixtures/questionnaires/habit-patterns-numeric-reference.json";
import { isMiniHabitConfigurationValid, scoreMiniHabitQuestionnaire } from "@/lib/questionnaires/miniHabit";
import { QuestionnaireHabitReport } from "@/components/questionnaires/QuestionnaireHabitReport";
import type { MiniHabitQuestionnaire } from "@/lib/questionnaires/miniHabit";

const quiz = data as unknown as MiniHabitQuestionnaire;
const base = () => Object.fromEntries(data.questions.map(q => [q.id, "3"]));
function complete(answers: unknown) {
  const result = scoreMiniHabitQuestionnaire(quiz, answers);
  if (result.status !== "complete") throw new Error("Expected a complete synthetic record");
  return result;
}

describe("original habit-patterns form", () => {
  it("preserves all20 original statements, five groups, original skips and full manuscripts", () => {
    expect(isMiniHabitConfigurationValid(data)).toBe(true);
    expect(data.questions).toHaveLength(20);
    expect(data.minimumRatedItems).toBe(source.source_minimum_numeric_per_four);
    expect(data.source.itemBankSha256).toBe(source.source_item_bank_sha256);
    expect(data.source.formCode).toBe(source.source_form);
    expect(data.profiles).toEqual(profiles);
    expect(data.source.resultContentSha256).toBe(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/habit-patterns-profiles-reference.json")).digest("hex"));
    for (const [i, item] of source.items.entries()) {
      const q = data.questions[i], factor = source.source_factors[Math.floor(i / 4)];
      expect(q.id).toBe(item.id); expect(q.prompt.zh).toBe(item.prompt);
      expect(q.reverse).toBe(item.reverse_scored); expect(item.factor).toBe(factor.source_code);
      expect(q.options.map(o => o.directionId)).toEqual(Array(6).fill(factor.id));
      expect(q.options.slice(0, 5).map(o => o.label.zh)).toEqual(Object.values(source.numeric_labels));
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options.at(-1)).toMatchObject({ id: "na", label: { zh: source.skip_zh } });
    }
  });
  it("matches all6480 four-item marginal choices to independent exact-fraction references", () => {
    const means = new Map(numbers.rows.map(r => [`${r.rated}:${r.sum}`, r.mean]));
    let checked = 0;
    for (let part = 0; part < 5; part++) for (let pattern = 0; pattern < 1296; pattern++) {
      const answers = base(); let rest = pattern, sum = 0, rated = 0;
      for (let i = 0; i < 4; i++) {
        const v = rest % 6; rest = Math.floor(rest / 6);
        answers[data.questions[part * 4 + i].id] = v === 0 ? "na" : String(v);
        if (v) { sum += v; rated++; }
      }
      const score = complete(answers).facets[data.directions[part].id];
      expect(score).toEqual({ sum, rated, total: 4, mean: rated >= 3 ? means.get(`${rated}:${sum}`) : null });
      checked++;
    }
    expect(checked).toBe(6480); // Factor-wise6^4, not a joint6^20 enumeration.
  });
  it("distinguishes skipped, unfinished and invalid records without reading accessors", () => {
    const allNA = complete(Object.fromEntries(data.questions.map(q => [q.id, "na"])));
    expect(Object.values(allNA.facets).every(p => p.mean === null)).toBe(true);
    for (const q of data.questions) { const a = base(); delete a[q.id]; expect(scoreMiniHabitQuestionnaire(quiz, a).status).toBe("incomplete"); }
    for (const value of ["0", "6", "NaN", 3, null, true, undefined]) expect(scoreMiniHabitQuestionnaire(quiz, { [data.questions[0].id]: value }).status).toBe("invalid");
    const accessor = {}; Object.defineProperty(accessor, data.questions[0].id, { enumerable: true, get() { throw new Error("must not read"); } });
    expect(scoreMiniHabitQuestionnaire(quiz, accessor).status).toBe("invalid");
    expect(scoreMiniHabitQuestionnaire(quiz, { unknown: "3" }).status).toBe("invalid");
  });
  it("fails closed when required identity or a complete manuscript is missing", () => {
    for (const key of ["questions", "profiles", "directions", "guide", "faq"] as const) {
      const damaged = structuredClone(data); delete damaged[key][0];
      expect(isMiniHabitConfigurationValid(damaged)).toBe(false);
      expect(scoreMiniHabitQuestionnaire(damaged, {}).status).toBe("unavailable");
    }
    const damaged = structuredClone(data); damaged.profiles[0].sections[0].paragraphs[0].en = "";
    expect(isMiniHabitConfigurationValid(damaged)).toBe(false);
    const wrong = structuredClone(data); wrong.minimumRatedItems = 4;
    expect(isMiniHabitConfigurationValid(wrong)).toBe(false);
  });
  it("renders full available bodies but withholds all personal interpretations for allNA", () => {
    for (const locale of ["en", "zh"] as const) {
      const full = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireHabitReport quiz={quiz} result={complete(base())} locale={locale} />), "text/html");
      expect(full.querySelectorAll("[data-habit-part]")).toHaveLength(5);
      expect(full.querySelectorAll("[data-habit-mean]")).toHaveLength(5);
      let paragraphs = 0;
      for (const profile of profiles) for (const section of profile.sections) for (const para of section.paragraphs) {
        expect(full.querySelector(`[id="habit-report-${profile.id}-${section.id}"]`)?.textContent).toContain(para[locale]); paragraphs++;
      }
      expect(paragraphs).toBe(60);
      const ids = Array.from(full.querySelectorAll("[id]")).map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
      const allNA = complete(Object.fromEntries(data.questions.map(q => [q.id, "na"])));
      const empty = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireHabitReport quiz={quiz} result={allNA} locale={locale} />), "text/html");
      expect(empty.querySelectorAll("[data-habit-part], [data-habit-mean], [data-habit-sum]")).toHaveLength(0);
      expect(empty.querySelector("[data-habit-all-insufficient]")).not.toBeNull();
      expect(empty.body.textContent).not.toContain(profiles[0].sections[0].paragraphs[0][locale]);
      const partial = base(); partial[data.questions[0].id] = "na"; partial[data.questions[4].id] = "na"; partial[data.questions[5].id] = "na";
      const parsed = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireHabitReport quiz={quiz} result={complete(partial)} locale={locale} />), "text/html");
      expect(parsed.querySelectorAll("[data-habit-mean]")).toHaveLength(4);
      expect(parsed.querySelector('[data-habit-part="automatic-starts"] [data-habit-insufficient]')).not.toBeNull();
      expect(parsed.querySelector('[data-habit-part="automatic-starts"]')?.textContent).not.toContain(profiles[1].sections[0].paragraphs[0][locale]);
    }
  });
});
