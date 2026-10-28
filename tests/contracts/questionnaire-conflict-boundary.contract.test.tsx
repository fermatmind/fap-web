import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/conflict-boundary-behaviors-test.json";
import source from "@/tests/fixtures/questionnaires/conflict-boundary-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/conflict-boundary-profiles-reference.json";
import numeric from "@/tests/fixtures/questionnaires/conflict-boundary-numeric-reference.json";
import { isMiniConflictConfigurationValid, scoreMiniConflictQuestionnaire, type MiniConflictQuestionnaire } from "@/lib/questionnaires/miniConflict";
import { QuestionnaireConflictReport } from "@/components/questionnaires/QuestionnaireConflictReport";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";

const quiz = data as unknown as MiniConflictQuestionnaire;
const base = () => Object.fromEntries(data.questions.map(q => [q.id, "3"]));
function complete(answers: unknown) {
  const result = scoreMiniConflictQuestionnaire(quiz, answers);
  if (result.status !== "complete") throw new Error("Expected a complete synthetic record");
  return result;
}
describe("original conflict and boundary Mini form", () => {
  it("retains all24 Chinese statements, six response choices, four fixed factors and complete manuscripts", () => {
    expect(isMiniConflictConfigurationValid(quiz)).toBe(true);
    expect(data.source.itemBankSha256).toBe(source.source_item_bank_sha256);
    expect(data.source.formCode).toBe(source.source_form);
    expect(data.profiles).toEqual(profiles);
    expect(data.source.resultContentSha256).toBe(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/conflict-boundary-profiles-reference.json")).digest("hex"));
    for (const [i, item] of source.items.entries()) {
      const q = data.questions[i];
      expect(q.id).toBe(item.id); expect(q.prompt.zh).toBe(item.prompt); expect(q.reverse).toBe(item.reverse_scored);
      expect(q.options.map(o => o.directionId)).toEqual(Array(6).fill(item.factor));
      expect(q.options.slice(0, 5).map(o => o.label.zh)).toEqual(Object.values(source.numeric_labels));
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options.at(-1)).toMatchObject({ id: "na", label: { zh: source.skip_zh } });
    }
  });
  it("matches364 original-scorer-checked witnesses for every reachable marginal count/sum state", () => {
    expect(numeric.rows).toHaveLength(91); let checked = 0;
    for (let g = 0; g < 4; g++) for (const row of numeric.rows) {
      const answers = base();
      row.witness.forEach((v, i) => { answers[data.questions[g * 6 + i].id] = v; });
      expect(complete(answers).facets[data.directions[g].id]).toEqual({ sum: row.sum, rated: row.rated, total: 6, mean: row.mean }); checked++;
    }
    expect(checked).toBe(364); // Count/sum DP witnesses, not a joint6^24 enumeration.
  });
  it("withholds incomplete and invalid records without calling getters or treating skips as missing", () => {
    for (const q of data.questions) { const a = base(); delete a[q.id]; expect(scoreMiniConflictQuestionnaire(quiz, a).status).toBe("incomplete"); }
    for (const value of ["0", "6", "NaN", 3, null, true, undefined]) expect(scoreMiniConflictQuestionnaire(quiz, { CBS_001: value }).status).toBe("invalid");
    const a = {}; Object.defineProperty(a, "CBS_001", { enumerable: true, get() { throw new Error("Do not invoke"); } });
    expect(scoreMiniConflictQuestionnaire(quiz, a).status).toBe("invalid");
    expect(scoreMiniConflictQuestionnaire(quiz, { ...base(), unknown: "3" }).status).toBe("invalid");
    const graded = structuredClone(quiz); graded.questions[0].correctOptionId = "5"; expect(isMiniConflictConfigurationValid(graded)).toBe(false);
    expect(complete(Object.fromEntries(data.questions.map(q => [q.id, "na"]))).answered).toBe(24);
    for (const key of ["questions", "profiles", "directions", "guide", "faq"] as const) {
      const damaged = structuredClone(data); delete damaged[key][0]; expect(isMiniConflictConfigurationValid(damaged)).toBe(false);
    }
  });
  it("shows all64 paragraph pairs when available, withholds every personal factor for allNA and only the insufficient part for mixed records", () => {
    for (const locale of ["en", "zh"] as const) {
      const parse = (a: unknown) => new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireConflictReport quiz={quiz} result={complete(a)} locale={locale} />), "text/html");
      const full = parse(base()); expect(full.querySelectorAll("[data-conflict-part]")).toHaveLength(4);
      expect(full.body.textContent).toContain(locale === "zh" ? "过去三个月" : "past three months");
      for (const p of profiles) for (const s of p.sections) for (const para of s.paragraphs) expect(full.querySelector(`[id="conflict-report-${p.id}-${s.id}"]`)?.textContent).toContain(para[locale]);
      const allNA = parse(Object.fromEntries(data.questions.map(q => [q.id, "na"])));
      expect(allNA.querySelector("[data-conflict-all-insufficient]")).not.toBeNull();
      expect(allNA.querySelectorAll("[data-conflict-part], [data-conflict-mean], [data-conflict-sum], [id^=conflict-report-]")).toHaveLength(0);
      const mixed = base(); for (const i of [3, 4, 8, 9, 10]) mixed[data.questions[i].id] = "na";
      const partial = parse(mixed); expect(partial.querySelectorAll("[data-conflict-mean]")).toHaveLength(3);
      expect(partial.querySelector('[data-conflict-part="CONFLICT_ESCALATION"] [data-conflict-mean]')?.textContent).toContain("12 ÷ 4");
      const insufficient = partial.querySelector('[data-conflict-part="BOUNDARY_OVERRIDE"]');
      expect(insufficient?.querySelector("[data-conflict-insufficient]")).not.toBeNull();
      expect(insufficient?.querySelectorAll("[data-conflict-mean], [data-conflict-sum], [id^=conflict-report-]")).toHaveLength(0);
    }
  });
  it("stops global analytics on both entries and every general guide while leaving unrelated routes alone", () => {
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...data.profiles.map(p => `/results/${p.id}`)]) {
      const path = `https://fermatmind.com/${locale}/tests/explore/conflict-boundary-behaviors-test${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true); expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
    }
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/stress-response-patterns-test")).toBe(false);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/conflict-boundary-behaviors-test-other")).toBe(false);
  });
});
