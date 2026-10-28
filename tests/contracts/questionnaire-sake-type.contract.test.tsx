import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const quiz = read("lib/questionnaires/data/sake-type.json") as Questionnaire;
const originalQuestions = read("tests/fixtures/questionnaires/sake-type-questions-reference.json") as Questionnaire["questions"];
const fullProfiles = read("tests/fixtures/questionnaires/sake-type-profiles-reference.json") as Questionnaire["profiles"];
const states = read("tests/fixtures/questionnaires/sake-type-counts-reference.json").states as { counts: number[]; highestIndices: number[] }[];
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const witness = (counts: number[]): QuestionnaireAnswers => {
  const directions = counts.flatMap((count, i) => Array(count).fill(quiz.directions[i].id) as string[]);
  if (directions.length !== 16) throw Error("A complete count witness needs sixteen choices");
  return Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options.find(o => o.directionId === directions[i])!.id]));
};
const complete = (a: unknown) => { const r = scoreQuestionnaire(quiz, a); if (r.status !== "complete" || !("profileIds" in r)) throw Error("Expected registered archetype result"); return r; };

describe("Frozen J Sake Type: original four drink metaphors without drinking or trait measurement", () => {
  it("registers the exact original16x4 bank, balanced positions and four full bilingual six-section guides", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(isArchetypeConfigurationValid(quiz)).toBe(true);
    expect(quiz.code).toBe("FM_SAKE_METAPHOR16"); expect(quiz.version).toBe("fm_sake_fourchoice16_v1");
    expect(quiz.source.kind).toBe("fermatmind_original_four_drink_metaphor_game"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.scoringVersion).toBe("fm_sake_fourchoice16_rawcounts_allmax_v1"); expect(quiz.questions).toEqual(originalQuestions); expect(quiz.profiles).toEqual(fullProfiles);
    expect(hash(originalQuestions)).toBe(quiz.source.itemBankSha256); expect(hash(fullProfiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(16); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.directions.map(d => d.id)).toEqual(["sparkling-wine", "beer", "whisky", "sake"]);
    for (const [i, q] of quiz.questions.entries()) {
      expect(q.id).toBe(`SKM_${String(i + 1).padStart(2, "0")}`); expect(q.options.map(o => o.id)).toEqual(["a", "b", "c", "d"]);
      expect(new Set(q.options.map(o => o.directionId)).size).toBe(4); expect(q.options.every(o => o.score === undefined)).toBe(true); expect(q.correctOptionId).toBeUndefined(); expect(q.explanation).toBeUndefined(); expect(q.reverse).toBeUndefined();
      expect(q.prompt.en).not.toMatch(/drink|alcohol|wine|beer|whisky|sake|how old/i); expect(q.prompt.zh).not.toMatch(/饮酒|喝酒|几岁|年龄/);
    }
    for (const d of quiz.directions) { expect(d.comparisons).toBe(16); for (let position = 0; position < 4; position++) expect(quiz.questions.filter(q => q.options[position].directionId === d.id)).toHaveLength(4); }
    for (const p of quiz.profiles) { expect(p.directionIds).toEqual([p.id]); expect(p.sections.map(s => s.id)).toEqual(["image", "context", "compare", "scene", "try", "reading"]); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(new Set(quiz.profiles.map(p => p.headline.en)).size).toBe(4); expect(new Set(quiz.profiles.map(p => p.headline.zh)).size).toBe(4);
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const x = value as Record<string, unknown>; if ("en" in x || "zh" in x) { expect(typeof x.en).toBe("string"); expect(x.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u); expect(x.zh).toMatch(/\p{Script=Han}/u); } else Object.values(x).forEach(visit); }; visit(quiz);
  });
  it("maps every969 integer count composition through real rotated optionIDs and preserves all15 highest sets", () => {
    expect(states).toHaveLength(969); const seen = new Set<string>();
    for (const state of states) {
      const r = complete(witness(state.counts)); expect(Object.values(r.counts)).toEqual(state.counts); expect(Object.values(r.counts).reduce((a, b) => a + b, 0)).toBe(16);
      expect(r.profileIds).toEqual(state.highestIndices.map(i => quiz.profiles[i].id)); expect(Object.keys(r)).toEqual(["status", "answered", "counts", "profileIds"]);
      seen.add(r.profileIds.join("|"));
    }
    expect(seen.size).toBe(15); expect(complete(witness([4, 4, 4, 4])).profileIds).toEqual(quiz.profiles.map(p => p.id));
    expect(complete(witness([6, 6, 3, 1])).profileIds).toEqual(["sparkling-wine", "beer"]); expect(complete(witness([7, 6, 2, 1])).profileIds).toEqual(["sparkling-wine"]);
  });
  it("displays all matching full bodies for every15 winner subset in both languages without a tie-break", () => {
    const first = new Map<string, number[]>(); for (const s of states) { const k = s.highestIndices.join("|"); if (!first.has(k)) first.set(k, s.counts); }
    for (const counts of first.values()) for (const locale of ["en", "zh"] as const) {
      const r = complete(witness(counts)); const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={quiz} result={r} locale={locale} />);
      expect(dom.querySelectorAll("[data-archetype-count]")).toHaveLength(4); expect(dom.querySelectorAll("[data-archetype-match]")).toHaveLength(r.profileIds.length);
      for (const id of r.profileIds) { const p = quiz.profiles.find(x => x.id === id)!; const own = dom.querySelector(`[data-archetype-match="${id}"]`)!; expect(own.querySelector("h3")?.textContent).toBe(p.title[locale]); expect(own.querySelectorAll("h4")).toHaveLength(6); for (const section of p.sections) for (const paragraph of section.paragraphs) expect(own.textContent).toContain(paragraph[locale]); }
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.textContent).toContain(locale === "zh" ? "不是相似度百分比" : "not a match percentage");
    }
  });
  it("withholds every partial result and rejects illegal JSON options, unknown items and no-fit aliases", () => {
    const a = witness([16, 0, 0, 0]);
    for (let n = 0; n < 16; n++) expect(scoreQuestionnaire(quiz, Object.fromEntries(Object.entries(a).slice(0, n)))).toEqual({ status: "incomplete", answered: n });
    for (const bad of [null, undefined, [], new Date(), Object.create(a), { ...a, unrelated: "a" }]) expect(scoreQuestionnaire(quiz, bad).status).toBe("invalid");
    for (const q of quiz.questions) for (const bad of [null, undefined, false, true, 0, 1, "", "na", "skip", "A", " a ", "1", [], {}]) expect(scoreQuestionnaire(quiz, { ...a, [q.id]: bad }).status).toBe("invalid");
    expect(scoreQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))).status).toBe("invalid");
  });
  it("binds optional JSON drafts to this form/version/24hours and clears malformed or foreign records", () => {
    const now = 1_800_000_000_000, a = { [quiz.questions[0].id]: "a" };
    const draft = (changes = {}) => JSON.stringify({ version: quiz.version, savedAt: now, answers: a, ...changes });
    expect(readQuestionnaireDraft(quiz, draft(), now)).toEqual(a);
    for (const changes of [{ version: "other" }, { savedAt: now + 1 }, { savedAt: now - 86400000 }, { answers: { ...a, bogus: "a" } }, { answers: { [quiz.questions[0].id]: "na" } }]) expect(readQuestionnaireDraft(quiz, draft(changes), now)).toBeNull();
    expect(readQuestionnaireDraft(quiz, "{", now)).toBeNull();
  });
  it("publishes a complete four-position response key matching the actual option rotation", () => {
    const key = quiz.guide.find(s => s.id === "answer-key")!; expect(key.paragraphs).toHaveLength(4);
    const names = ["Sparkling Wine", "Beer", "Whisky", "Sake"];
    key.paragraphs.forEach((p, group) => { const order = [...p.en.matchAll(/→ (Sparkling Wine|Beer|Whisky|Sake)/g)].map(m => m[1]); expect(order).toEqual(quiz.questions[group].options.map(o => names[quiz.directions.findIndex(d => d.id === o.directionId)])); for (let q = group; q < 16; q += 4) expect(quiz.questions[q].options.map(o => o.directionId)).toEqual(quiz.questions[group].options.map(o => o.directionId)); });
    expect(quiz.guide).toHaveLength(7); expect(quiz.faq).toHaveLength(6); expect(quiz.instructions!.en).toContain("stop and read all four complete guides");
  });
});
