import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import quizSource from "@/lib/questionnaires/data/mental-age.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isMentalAgeConfigurationValid, scoreMentalAgeQuestionnaire } from "@/lib/questionnaires/mentalAge";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnaireMentalAgeReport } from "@/components/questionnaires/QuestionnaireMentalAgeReport";
const quiz = quizSource as Questionnaire;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const answerPoints = (points: number[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options.find(o => o.score === points[i])!.id]));
const witness = (sum: number) => Array.from({ length: 12 }, (_, i) => Math.min(3, Math.max(0, sum - i * 3)));

describe("T010 original playful age with transparent arithmetic and no age inference", () => {
  it("binds the original twelve daily-preference items and all37 ages to one complete bilingual reading", () => {
    expect(isMentalAgeConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.questions).toHaveLength(12); expect(quiz.profiles).toHaveLength(1);
    expect(quiz.profiles[0].sections).toHaveLength(8); expect(quiz.profiles[0].sections.every(s => s.paragraphs.length === 2)).toBe(true);
    const leaves = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(leaves); }; leaves(quiz);
    expect(quiz.description.en.length).toBeLessThanOrEqual(160); expect(quiz.profiles[0].seo!.description.en.length).toBeLessThanOrEqual(160);
    const body = quiz.profiles[0].sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" "); expect(body.split(/\s+/).length).toBeGreaterThan(850);
  });
  it("reaches every even age18..90 and checks independent sums for4096 mixed patterns", () => {
    const ages = new Set<number>();
    for (let sum = 0; sum <= 36; sum++) {
      const points = witness(sum), answers = answerPoints(points), r = scoreQuestionnaire(quiz, answers);
      expect(r).toEqual({ status: "complete", answered: 12, mentalAge: { sum, playfulAge: 18 + sum * 2, points: Object.fromEntries(quiz.questions.map((q, i) => [q.id, points[i]])) } });
      if (r.status === "complete" && "mentalAge" in r) ages.add(r.mentalAge.playfulAge);
    }
    expect([...ages]).toEqual(Array.from({ length: 37 }, (_, i) => 18 + i * 2));
    for (let code = 0; code < 4096; code++) {
      let state = code + 1; const points = Array.from({ length: 12 }, () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state >>> 30; });
      const r = scoreMentalAgeQuestionnaire(quiz, answerPoints(points)); expect(r.status).toBe("complete");
      if (r.status !== "complete") throw Error("Expected complete"); const sum = points.reduce((a, b) => a + b, 0); expect(r.mentalAge.sum).toBe(sum); expect(r.mentalAge.playfulAge).toBe(18 + 2 * sum);
    }
    expect(scoreMentalAgeQuestionnaire(quiz, answerPoints([0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]))).toMatchObject({ mentalAge: { sum: 18, playfulAge: 54 } });
    expect(scoreMentalAgeQuestionnaire(quiz, answerPoints([0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3]))).toMatchObject({ mentalAge: { sum: 18, playfulAge: 54 } });
  });
  it("does not expose a partial age; rejects invalid, inherited, accessor or foreign answers", () => {
    const a = answerPoints(Array(12).fill(1));
    for (let n = 0; n < 12; n++) expect(scoreMentalAgeQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, foreign: "a" }, { ...a, [Symbol("private")]: "a" }, Object.defineProperty({ ...a }, "MAGE_01", { get() { throw Error("must not run"); } }), Object.defineProperty({ ...a }, "MAGE_01", { value: "a", enumerable: false })]) expect(scoreMentalAgeQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [0, 1, null, undefined, true, "0", "A", " a ", "na", "skip", [], {}]) expect(scoreMentalAgeQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    expect(scoreMentalAgeQuestionnaire(quiz, Object.assign(Object.create(null), a)).status).toBe("complete");
    const now = 1800000000000, draft = (patch = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: { MAGE_01: "a" }, ...patch });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ MAGE_01: "a" });
    for (const patch of [{ version: "old" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { MAGE_01: "na" } }]) expect(readQuestionnaireDraft(quiz, draft(patch), now)).toBeNull();
  });
  it("fails closed for drifted scores, source identity, sparse bank or incomplete public content", () => {
    const mutations = [
      (q: Questionnaire) => { q.questions[0].options[0].score = 3; }, (q: Questionnaire) => { delete q.questions[1]; },
      (q: Questionnaire) => { delete q.questions[0].options[1]; }, (q: Questionnaire) => { q.questions[0].correctOptionId = "a"; },
      (q: Questionnaire) => { q.source.scoringVersion = "foreign"; }, (q: Questionnaire) => { q.directions[0].itemCount = 11; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); }, (q: Questionnaire) => { q.questions[0].prompt.en = ""; },
      (q: Questionnaire) => { q.profiles[0].id = "young"; }, (q: Questionnaire) => { q.guide.pop(); },
    ];
    for (const mutate of mutations) { const q = structuredClone(quiz); mutate(q); expect(isMentalAgeConfigurationValid(q)).toBe(false); expect(scoreQuestionnaire(q, {})).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("renders the exact arithmetic, all choices and every full paragraph for all37 outputs in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (let sum = 0; sum <= 36; sum++) {
      const answers = answerPoints(witness(sum)), result = scoreMentalAgeQuestionnaire(quiz, answers); if (result.status !== "complete") throw Error("Expected result");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireMentalAgeReport quiz={quiz} result={result} answers={answers} locale={locale} />);
      expect(dom.querySelector("[data-mental-age-value]")?.textContent).toBe(`${18 + 2 * sum}${locale === "zh" ? "岁" : " years"}`); expect(dom.querySelectorAll("[data-mental-age-answer]")).toHaveLength(12); expect(dom.querySelectorAll("h4")).toHaveLength(8);
      for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-mental-age-answer="${q.id}"]`)?.textContent).toContain(q.options.find(o => o.id === answers[q.id])!.label[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), n => n.id); expect(ids.length).toBe(new Set(ids).size); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
