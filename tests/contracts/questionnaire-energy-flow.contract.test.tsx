import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import source from "@/lib/questionnaires/data/energy-flow.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { QuestionnaireEnergyFlowReport } from "@/components/questionnaires/QuestionnaireEnergyFlowReport";
const quiz = source as Questionnaire;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const answers = (values: string[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const complete = (values: string[]) => { const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw Error("Expected four independent facets"); return r; };

describe("Frozen J energy-flow original20 recent-experience ratings", () => {
  it("registers the adopted original four-by-five source, four full8 readings and honest bilingual scope", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("likert"); expect(quiz.code).toBe("FM_ENERGY_FLOW20"); expect(quiz.minimumRatedItems).toBe(3);
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles)); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["earlier-day", "effort-blocks", "focus-conditions", "pause-noticing"]); expect(quiz.profiles).toHaveLength(4); expect(quiz.questions).toHaveLength(20);
    for (const [i, q] of quiz.questions.entries()) { expect(q.id).toBe(`EFR_${Math.floor(i / 5) + 1}_${String(i % 5 + 1).padStart(2, "0")}`); expect(q.reverse).toBe(false); expect(q.correctOptionId).toBeUndefined(); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === quiz.directions[Math.floor(i / 5)].id)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(700); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const leaves = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(leaves); }; leaves(quiz);
    expect(quiz.description.en.length).toBeLessThanOrEqual(160); expect(quiz.instructions!.en).toContain("past two weeks"); expect(quiz.instructions!.en).toContain("three numeric");
  });
  it("checks all7776 single-topic patterns for each of4 independent facets against external raw arithmetic", () => {
    const options = ["na", "1", "2", "3", "4", "5"];
    for (let group = 0; group < 4; group++) for (let code = 0; code < 6 ** 5; code++) {
      let encoded = code; const values = Array(20).fill("na"), numeric: number[] = [];
      for (let i = 0; i < 5; i++) { const value = options[encoded % 6]; encoded = Math.floor(encoded / 6); values[group * 5 + i] = value; if (value !== "na") numeric.push(Number(value)); }
      const r = complete(values), sum = numeric.reduce((a, b) => a + b, 0), count = numeric.length;
      expect(r.facets[quiz.directions[group].id]).toEqual({ sum, rated: count, total: 5, mean: count < 3 ? null : Math.round(sum / count * 10) / 10 });
      for (const d of quiz.directions.filter((_, i) => i !== group)) expect(r.facets[d.id]).toEqual({ sum: 0, rated: 0, total: 5, mean: null });
      expect(r).not.toHaveProperty("profileId"); expect(r).not.toHaveProperty("total"); expect(r).not.toHaveProperty("chronotype");
    }
  }, 30000);
  it("withholds incomplete attempts, rejects invalid values and restores only unexpired matching drafts", () => {
    const a = answers(Array(20).fill("3")); for (let n = 0; n < 20; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, unknown: "3" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [0, 1, null, undefined, true, "0", "6", "skip", " 3 ", "a", [], {}]) expect(scoreQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    const now = 1800000000000, draft = (patch = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: { EFR_1_01: "na" }, ...patch }); expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ EFR_1_01: "na" });
    for (const patch of [{ version: "foreign" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { EFR_1_01: "skip" } }, { answers: { unknown: "3" } }]) expect(readQuestionnaireDraft(quiz, draft(patch), now)).toBeNull();
  });
  it("renders every FULL even with0..5 numeric responses in every facet, without ranking or an overall score", () => {
    for (const locale of ["en", "zh"] as const) for (let n = 0; n <= 5; n++) {
      const values = Array.from({ length: 20 }, (_, i) => i % 5 < n ? "4" : "na"), r = complete(values), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireEnergyFlowReport quiz={quiz} result={r} answers={answers(values)} locale={locale} />);
      expect(dom.querySelectorAll("[data-energy-topic]")).toHaveLength(4); expect(dom.querySelectorAll("[data-energy-full]")).toHaveLength(4); expect(dom.querySelectorAll("h4")).toHaveLength(32); expect(dom.querySelectorAll("[data-energy-answer]")).toHaveLength(20);
      for (const d of quiz.directions) { expect(dom.querySelector(`[data-energy-count="${d.id}"]`)?.textContent).toBe(`${n} / 5`); expect(dom.querySelector(`[data-energy-sum="${d.id}"]`)?.textContent).toBe(n ? String(n * 4) : "—"); expect(dom.querySelector(`[data-energy-mean="${d.id}"]`)?.textContent).toBe(n < 3 ? (locale === "zh" ? "不计算" : "Not calculated") : "4.0 / 5"); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), n => n.id); expect(ids.length).toBe(new Set(ids).size); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}|Core Expression|Pattern Consistency/u);
    }
  });
});
