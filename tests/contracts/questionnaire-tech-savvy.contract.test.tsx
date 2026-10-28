import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { QuestionnaireTechConfidenceReport } from "@/components/questionnaires/QuestionnaireTechConfidenceReport";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const quiz = read("lib/questionnaires/data/tech-savvy.json") as Questionnaire;
const questions = read("tests/fixtures/questionnaires/tech-savvy-questions-reference.json") as Questionnaire["questions"];
const profiles = read("tests/fixtures/questionnaires/tech-savvy-profiles-reference.json") as Questionnaire["profiles"];
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const answers = (values: string[]): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
function complete(values: string[]) { const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw Error("Expected complete confidence self-rating"); return r; }

describe("Frozen J Tech Savvy original six confidence ratings, without a proficiency classification", () => {
  it("registers the original six-item bank, one continuous FULL and documented editorial policy", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.code).toBe("FM_TECH_CONFIDENCE6"); expect(quiz.kind).toBe("likert"); expect(quiz.minimumRatedItems).toBe(4);
    expect(quiz.version).toBe("fm_tech_confidence6_v1"); expect(quiz.source.scoringVersion).toBe("fm_tech6_equalmean_min4_round1_v1");
    expect(quiz.source.kind).toBe("fermatmind_original_tool_learning_confidence"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.questions).toEqual(questions); expect(quiz.profiles).toEqual(profiles); expect(hash(questions)).toBe(quiz.source.itemBankSha256); expect(hash(profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.directions).toHaveLength(1); expect(quiz.directions[0].id).toBe("tool-confidence"); expect(quiz.directions[0].itemCount).toBe(6);
    expect(quiz.questions).toHaveLength(6); expect(quiz.profiles).toHaveLength(1); expect(quiz.profiles[0].sections.map(s => s.id)).toEqual(["confidence", "arithmetic", "contexts", "comparison", "try", "limits"]);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`TSC_${String(i + 1).padStart(2, "0")}`); expect(q.reverse).toBe(false); expect(q.correctOptionId).toBeUndefined(); expect(q.explanation).toBeUndefined();
      expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === "tool-confidence")).toBe(true);
      expect(q.prompt.en).not.toMatch(/Notion|Trello|Slack|Zapier|API|macros|salary|candidate/i);
    }
    expect(quiz.description.en.length).toBeLessThanOrEqual(160); expect(quiz.profiles[0].seo!.description.en.length).toBeLessThanOrEqual(160);
    const visit = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit); }; visit(quiz);
  });
  it("checks all46656 full answer patterns against independent raw arithmetic, including every missingness count", () => {
    const options = ["na", "1", "2", "3", "4", "5"], coverage = new Set<number>();
    for (let pattern = 0; pattern < 6 ** 6; pattern++) {
      let encoded = pattern; const values: string[] = []; for (let i = 0; i < 6; i++) { values.push(options[encoded % 6]); encoded = Math.floor(encoded / 6); }
      const numeric = values.filter(v => v !== "na").map(Number), sum = numeric.reduce((a, b) => a + b, 0), r = complete(values); coverage.add(numeric.length);
      expect(r).toEqual({ status: "complete", answered: 6, facets: { "tool-confidence": { sum, rated: numeric.length, total: 6, mean: numeric.length < 4 ? null : Math.round(sum / numeric.length * 10) / 10 } } });
      expect(r).not.toHaveProperty("profileIds"); expect(r).not.toHaveProperty("total"); expect(r).not.toHaveProperty("percentile");
    }
    expect([...coverage].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(complete(["2", "3", "4", "4", "5", "na"]).facets["tool-confidence"]).toEqual({ sum: 18, rated: 5, total: 6, mean: 3.6 });
    expect(complete(["4", "4", "4", "4", "na", "na"]).facets["tool-confidence"].mean).toBe(4);
    expect(complete(["4", "4", "4", "4", "4", "4"]).facets["tool-confidence"].mean).toBe(4);
  }, 30000);
  it("withholds every unfinished attempt, rejects foreign JSON choices and expires this form's optional draft", () => {
    const a = answers(Array(6).fill("3"));
    for (let count = 0; count < 6; count++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, count)))).toEqual({ status: "incomplete", answered: count });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, unknown: "3" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [0, 1, null, undefined, true, "0", "6", "skip", " 3 ", "a", [], {}]) expect(scoreQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    const now = 1800000000000, draft = (changes = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: { TSC_01: "na" }, ...changes });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ TSC_01: "na" });
    for (const d of [{ version: "foreign" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { TSC_01: "skip" } }, { answers: { unknown: "na" } }]) expect(readQuestionnaireDraft(quiz, draft(d), now)).toBeNull();
  });
  it("renders both languages with0..6coverage, missing data, all six local answers and every FULL paragraph", () => {
    for (const locale of ["en", "zh"] as const) for (let n = 0; n <= 6; n++) {
      const values = Array.from({ length: 6 }, (_, i) => i < n ? "4" : "na"), r = complete(values), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireTechConfidenceReport quiz={quiz} result={r} answers={answers(values)} locale={locale} />);
      expect(dom.querySelector("[data-tech-confidence-sum]")?.textContent).toBe(n ? String(n * 4) : "—"); expect(dom.querySelector("[data-tech-confidence-count]")?.textContent).toBe(`${n} / 6`);
      expect(dom.querySelector("[data-tech-confidence-mean]")?.textContent).toBe(n < 4 ? (locale === "zh" ? "不计算" : "Not calculated") : "4.0 / 5");
      expect(dom.querySelectorAll("[data-tech-confidence-insufficient]")).toHaveLength(n < 4 ? 1 : 0); expect(dom.querySelectorAll("[data-tech-confidence-answer]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(6);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-tech-confidence-answer="${q.id}"]`)?.textContent).toContain(q.options.find(o => o.id === values[quiz.questions.indexOf(q)])!.label[locale]);
      for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
      expect(dom.querySelectorAll("[data-facet-score], [data-archetype-match]")).toHaveLength(0); const ids = Array.from(dom.querySelectorAll("[id]"), x => x.id); expect(new Set(ids).size).toBe(ids.length);
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}|battery remaining|frequency answers|Pattern Consistency|Core Expression/u);
    }
  });
});
