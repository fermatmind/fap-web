import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import source from "@/lib/questionnaires/data/food-disgust.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { QuestionnaireFds32Report } from "@/components/questionnaires/QuestionnaireFds32Report";
const quiz = source as Questionnaire;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const answers = (values: string[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const complete = (values: string[]) => { const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw Error("Expected eight separate FDS means"); return r; };

describe("T072 published FDS32 English bank and declared Chinese working edition", () => {
  it("preserves all published Table2 wording, unequal groups and six-point endpoints without short-form substitution", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 5, 4, 4, 4, 4, 4, 3]); expect(quiz.questions).toHaveLength(32);
    const originalRows = quiz.questions.map((q, i) => ({ number: i + 1, code: q.id.slice(4), en: q.prompt.en }));
    expect(hash(originalRows)).toBe("e6ede4cccf6730140e29ae3db78927982b5e338295d920ca1fbc99de2f1116d9");
    expect(quiz.source.itemBankSha256).toBe(hash(quiz.questions)); expect(quiz.source.resultContentSha256).toBe(hash(quiz.profiles)); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const q of quiz.questions) { expect(q.reverse).toBe(false); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "6", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, 6, null]); expect(q.options[0].label.en).toBe("Not disgusting at all"); expect(q.options[5].label.en).toBe("Very disgusting"); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(700); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const leaves = (v: unknown): void => { if (!v || typeof v !== "object") return; const o = v as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(typeof o.zh).toBe("string"); expect(/\p{Script=Han}/u.test(o.zh as string) || (/^[2-5]$/.test(o.zh as string) && o.en === o.zh)).toBe(true); } else Object.values(o).forEach(leaves); }; leaves(quiz);
    expect(quiz.description.en.length).toBeLessThanOrEqual(160); expect(quiz.guide.find(g => g.id === "edition")!.paragraphs[0].en).toContain("prints five points");
  });
  it("checks all 31556 single-part patterns against separate integer arithmetic, including every missingness pattern", () => {
    let offset = 0, cases = 0; const choices = ["na", "1", "2", "3", "4", "5", "6"];
    for (const d of quiz.directions) {
      const n = d.itemCount!;
      for (let code = 0; code < 7 ** n; code++) {
        let encoded = code, sum = 0, rated = 0; const values = Array(32).fill("na");
        for (let i = 0; i < n; i++) { const v = choices[encoded % 7]; encoded = Math.floor(encoded / 7); values[offset + i] = v; if (v !== "na") { sum += Number(v); rated++; } }
        const r = complete(values), expected = rated === n ? Math.floor((sum * 20 + n) / (2 * n)) / 10 : null;
        expect(r.facets[d.id]).toEqual({ sum, rated, total: n, mean: expected });
        for (const other of quiz.directions.filter(o => o.id !== d.id)) expect(r.facets[other.id]).toEqual({ sum: 0, rated: 0, total: other.itemCount, mean: null });
        expect(Object.keys(r).sort()).toEqual(["answered", "facets", "status"]); cases++;
      }
      offset += n;
    }
    expect(cases).toBe(31556);
  }, 60000);
  it("rejects invalid answers, accessors and configuration drift; restores only matching unexpired drafts", () => {
    const a = answers(Array(32).fill("3")); for (let n = 0; n < 32; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, unknown: "3" }, { ...a, [Symbol()]: "3" }, Object.defineProperty({ ...a }, "FDS_MEAT1", { get: () => { throw Error("Accessor must not execute"); } })]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [0, 1, null, undefined, true, "0", "7", "skip", " 3 ", "a", [], {}]) expect(scoreQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    const mutations = [(q: Questionnaire) => { q.questions[0].reverse = true; }, (q: Questionnaire) => { q.questions[0].options[5].score = 5; }, (q: Questionnaire) => { q.directions[1].itemCount = 4; }, (q: Questionnaire) => { q.minimumRatedItems = 3; }, (q: Questionnaire) => { q.questions[10].options[0].directionId = "poor-hygiene"; }, (q: Questionnaire) => { q.profiles[0].sections.pop(); }];
    for (const mutate of mutations) { const changed = structuredClone(quiz); mutate(changed); expect(scoreQuestionnaire(changed, a).status).toBe("unavailable"); }
    const now = 1800000000000, draft = (patch = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: { FDS_MEAT1: "6" }, ...patch }); expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual({ FDS_MEAT1: "6" });
    for (const patch of [{ version: "foreign" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { FDS_MEAT1: "7" } }, { answers: { unknown: "3" } }]) expect(readQuestionnaireDraft(quiz, draft(patch), now)).toBeNull();
  });
  it("renders all eight full readings and source attribution for complete, partial and all-unscored responses", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["all", "partial", "none"]) {
      const values = quiz.questions.map((_, i) => mode === "all" ? "6" : mode === "none" || i % 4 === 0 ? "na" : "4"), r = complete(values), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireFds32Report quiz={quiz} result={r} answers={answers(values)} locale={locale} />);
      expect(dom.querySelectorAll("[data-fds-part]")).toHaveLength(8); expect(dom.querySelectorAll("[data-fds-full]")).toHaveLength(8); expect(dom.querySelectorAll("h4")).toHaveLength(64); expect(dom.querySelectorAll("[data-fds-answer]")).toHaveLength(32);
      let offset = 0; for (const d of quiz.directions) { const n = d.itemCount!, selected = values.slice(offset, offset + n), numeric = selected.filter(v => v !== "na"); expect(dom.querySelector(`[data-fds-count="${d.id}"]`)?.textContent).toBe(`${numeric.length} / ${n}`); expect(dom.querySelector(`[data-fds-mean="${d.id}"]`)?.textContent).toBe(numeric.length < n ? (locale === "zh" ? "不计算" : "Not calculated") : `${(numeric.reduce((a, b) => a + Number(b), 0) / n).toFixed(1)} / 6`); offset += n; }
      for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.textContent).toContain(t[locale]);
      expect(dom.querySelector('[data-fds-attribution] a[href="https://creativecommons.org/licenses/by/4.0/"]')).not.toBeNull(); const ids = Array.from(dom.querySelectorAll("[id]"), n => n.id); expect(ids.length).toBe(new Set(ids).size); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
