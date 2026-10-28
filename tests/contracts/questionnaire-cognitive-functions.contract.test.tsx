import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import source from "@/lib/questionnaires/data/cognitive-functions-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { QuestionnaireCognitiveFunctionsReport } from "@/components/questionnaires/QuestionnaireCognitiveFunctionsReport";
const quiz = source as Questionnaire;
const answers = (values: string[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const complete = (values: string[]) => { const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw Error("Expected eight independent summaries"); return r; };
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("T012 original eight-function reflection, independent of unpublished Mini pilot", () => {
  it("registers 32 original bilingual prompts with three direct and one reverse item per function", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.kind).toBe("likert"); expect(quiz.minimumRatedItems).toBe(3); expect(quiz.questions).toHaveLength(32);
    expect(quiz.directions.map(d => d.id)).toEqual(["ni", "ne", "si", "se", "ti", "te", "fi", "fe"]);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles));
    for (const [i, q] of quiz.questions.entries()) { expect(q.reverse).toBe(i % 4 === 3); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === quiz.directions[Math.floor(i / 4)].id)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs.map(t => t.en)).join(" ").split(/\s+/).length).toBeGreaterThan(700); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const leaves = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(leaves); }; leaves(quiz);
    expect(quiz.description.en.length).toBeLessThanOrEqual(160); expect(quiz.instructions!.en).toContain("past month"); expect(quiz.instructions!.en).toContain("6 minus");
    expect(readFileSync("components/questionnaires/QuestionnaireClient.tsx", "utf8")).toContain('quiz.slug === "cognitive-functions-test" ? <QuestionnaireCognitiveFunctionsReport');
  });
  it("checks all1296 single-topic response patterns for each of8 topics against independent reverse-key arithmetic", () => {
    const options = ["na", "1", "2", "3", "4", "5"];
    for (let group = 0; group < 8; group++) for (let code = 0; code < 6 ** 4; code++) {
      let encoded = code; const values = Array(32).fill("na"), numeric: number[] = [];
      for (let i = 0; i < 4; i++) { const value = options[encoded % 6]; encoded = Math.floor(encoded / 6); values[group * 4 + i] = value; if (value !== "na") numeric.push(i === 3 ? 6 - Number(value) : Number(value)); }
      const r = complete(values), sum = numeric.reduce((a, b) => a + b, 0), n = numeric.length;
      expect(r.facets[quiz.directions[group].id]).toEqual({ sum, rated: n, total: 4, mean: n < 3 ? null : Math.round(sum / n * 10) / 10 });
      for (const d of quiz.directions.filter((_, i) => i !== group)) expect(r.facets[d.id]).toEqual({ sum: 0, rated: 0, total: 4, mean: null });
      expect(r).not.toHaveProperty("profileId"); expect(r).not.toHaveProperty("stack"); expect(r).not.toHaveProperty("total");
    }
  }, 30000);
  it("keeps equal summaries and independently withholds insufficient data; recomputes edits without assigning types", () => {
    const values: string[] = Array.from({ length: 32 }, (_, i) => i % 4 === 3 ? "2" : "4");
    const r = complete(values); expect(Object.values(r.facets).every(f => f.mean === 4)).toBe(true);
    values[0] = "na"; expect(complete(values).facets.ni).toEqual({ sum: 12, rated: 3, total: 4, mean: 4 });
    values[1] = "na"; expect(complete(values).facets.ni).toEqual({ sum: 8, rated: 2, total: 4, mean: null }); expect(complete(values).facets.ne.mean).toBe(4);
    values[0] = "1"; expect(complete(values).facets.ni.mean).toBe(3); values[3] = "5"; expect(complete(values).facets.ni.mean).toBe(2);
  });
  it("withholds all incomplete attempts, rejects foreign inputs and restores only matching unexpired drafts", () => {
    const a = answers(Array(32).fill("3")); for (let n = 0; n < 32; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, unknown: "3" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [0, 1, null, undefined, true, "0", "6", "skip", " 3 ", "a", [], {}]) expect(scoreQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    const now = 1800000000000, draft = (patch = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: { CF_NI_01: "na" }, ...patch }); expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ CF_NI_01: "na" });
    for (const patch of [{ version: "foreign" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { CF_NI_01: "skip" } }, { answers: { unknown: "3" } }]) expect(readQuestionnaireDraft(quiz, draft(patch), now)).toBeNull();
  });
  it("renders eight FULL readings for0..4 numeric responses, raw keyed arithmetic and original answer review in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (let n = 0; n <= 4; n++) {
      const values = Array.from({ length: 32 }, (_, i) => i % 4 < n ? "4" : "na"), r = complete(values), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCognitiveFunctionsReport quiz={quiz} result={r} answers={answers(values)} locale={locale} />);
      expect(dom.querySelectorAll("[data-cognitive-topic]")).toHaveLength(8); expect(dom.querySelectorAll("[data-cognitive-full]")).toHaveLength(8); expect(dom.querySelectorAll("h4")).toHaveLength(56); expect(dom.querySelectorAll("[data-cognitive-answer]")).toHaveLength(32);
      for (const d of quiz.directions) { expect(dom.querySelector(`[data-cognitive-count="${d.id}"]`)?.textContent).toBe(`${n} / 4`); expect(dom.querySelector(`[data-cognitive-sum="${d.id}"]`)?.textContent).toBe(n ? String(n === 4 ? 14 : n * 4) : "—"); expect(dom.querySelector(`[data-cognitive-mean="${d.id}"]`)?.textContent).toBe(n < 3 ? (locale === "zh" ? "不计算" : "Not calculated") : `${n === 3 ? "4.0" : "3.5"} / 5`); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), n => n.id); expect(ids.length).toBe(new Set(ids).size); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}|Core Expression|Pattern Consistency/u);
    }
  });
});
