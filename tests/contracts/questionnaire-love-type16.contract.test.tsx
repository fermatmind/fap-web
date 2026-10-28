import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isLoveType16ConfigurationValid, LOVE_TYPE16_AXES } from "@/lib/questionnaires/loveType16";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireLoveType16Report } from "@/components/questionnaires/QuestionnaireLoveType16Report";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-type-16.json", "utf8")) as Questionnaire;
const copy = () => structuredClone(quiz);
const answersFor = (counts: number[]) => Object.fromEntries(quiz.questions.map((q, i) => {
  const axis = LOVE_TYPE16_AXES[Math.floor(i / 8)], direction = axis.sides[i % 8 < counts[Math.floor(i / 8)] ? 0 : 1];
  return [q.id, q.options.find(o => o.directionId === direction)!.id];
}));
const H = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");

describe("T015 independent original32 four comparisons and all16 neutral readings", () => {
  it("binds the original edition, balanced exposure, both languages and every complete guide", () => {
    expect(isLoveType16ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(H(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(H(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.profiles.map(p => p.id)).toEqual(["lcro", "lcre", "lcpo", "lcpe", "laro", "lare", "lapo", "lape", "fcro", "fcre", "fcpo", "fcpe", "faro", "fare", "fapo", "fape"]);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(32);
    for (const axis of LOVE_TYPE16_AXES) for (const side of axis.sides) for (const position of [0, 1]) expect(quiz.questions.filter(q => q.options[position].directionId === side)).toHaveLength(4);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(700);
      for (const locale of ["en", "zh"] as const) for (const s of p.sections) for (const t of s.paragraphs) expect(t[locale].trim().length).toBeGreaterThan(25);
      expect(p.sections.find(s => s.id === "nearby")!.paragraphs.map(t => t.en).join(" ").match(/[LF][CA][RP][OE]/g)).toHaveLength(4);
    }
  });
  it("recomputes all6561 count vectors, all81 tie masks and all16 single outcomes without a ranked tie-break", () => {
    const masks = new Set<string>(), singles = new Set<string>(), sizes = new Set<number>(); let vectors = 0;
    for (let l = 0; l <= 8; l++) for (let c = 0; c <= 8; c++) for (let r = 0; r <= 8; r++) for (let o = 0; o <= 8; o++) {
      const counts = [l, c, r, o], result = scoreQuestionnaire(quiz, answersFor(counts));
      if (result.status !== "complete" || !("loveType16" in result)) throw new Error("A valid complete attempt was not interpreted");
      const mask = counts.map(n => n === 4 ? "=" : n > 4 ? ">" : "<").join(""); masks.add(mask); sizes.add(result.compatibleProfileIds.length);
      const expected = quiz.profiles.filter(p => counts.every((n, i) => n === 4 || p.id[i] === (n > 4 ? "lcro"[i] : "fape"[i]))).map(p => p.id);
      expect(result.compatibleProfileIds).toEqual(expected); expect(result.compatibleProfileIds.length).toBe(2 ** counts.filter(n => n === 4).length);
      result.loveType16.forEach((axis, i) => { expect(axis.counts[LOVE_TYPE16_AXES[i].sides[0]]).toBe(counts[i]); expect(Object.values(axis.counts).reduce((a, b) => a + b, 0)).toBe(8); });
      expect("total" in result).toBe(false); if (expected.length === 1) singles.add(expected[0]); vectors++;
    }
    expect(vectors).toBe(6561); expect(masks.size).toBe(81); expect(singles.size).toBe(16); expect([...sizes].sort((a, b) => a - b)).toEqual([1, 2, 4, 8, 16]);
  });
  it("withholds partial attempts, rejects unknown/tampered answers, and validates session draft age and version", () => {
    const answers = answersFor([8, 8, 8, 8]); const partial = { ...answers }; delete partial.LT_APPROACH_08;
    expect(scoreQuestionnaire(quiz, partial)).toMatchObject({ status: "incomplete", answered: 31 });
    for (const v of [null, [], "LCRO", { ...answers, LT_PACE_01: "A" }, { ...answers, unknown: "L" }, { ...answers, LT_PACE_01: 1 }, new Date()]) expect(scoreQuestionnaire(quiz, v).status).toBe("invalid");
    const now = 1_793_000_000_000, draft = (savedAt: number, version = quiz.version) => JSON.stringify({ answers: partial, savedAt, version });
    expect(readQuestionnaireDraft(quiz, draft(now - 100), now)).toEqual(partial);
    for (const raw of [draft(now + 1), draft(now - 86400000), draft(now, "official"), "bad", JSON.stringify({ answers: { bad: "C" }, version: quiz.version, savedAt: now })]) expect(readQuestionnaireDraft(quiz, raw, now)).toBeNull();
  });
  it("fails closed when the four-axis recipe or full result inventory is malformed", () => {
    const variants: Questionnaire[] = [];
    const change = (f: (q: Questionnaire) => void) => { const q = copy(); f(q); variants.push(q); };
    change(q => q.profiles.pop()); change(q => q.questions.pop()); change(q => { q.questions[0].options[0].directionId = "f"; });
    change(q => { q.questions[1].options.reverse(); }); change(q => { q.questions[0].reverse = true; });
    change(q => { q.source.scoringVersion = "random"; }); change(q => { q.source.itemBankSha256 = "bad"; });
    change(q => { q.profiles[0].sections[0].paragraphs.pop(); }); change(q => { q.profiles[0].sections[0].paragraphs[0].zh = ""; });
    change(q => { q.profiles[0].directionIds = ["l", "c", "r", "e"]; }); change(q => { q.directions[0].comparisons = 7; });
    for (const q of variants) { expect(isLoveType16ConfigurationValid(q)).toBe(false); expect(scoreQuestionnaire(q, answersFor([8, 8, 8, 8])).status).toBe("unavailable"); }
  });
  it("renders each single full guide and all16 tied full guides without a paywall or mandatory partner action", () => {
    for (const counts of [[8, 8, 8, 8], [4, 4, 4, 4], [4, 8, 0, 4]]) {
      const result = scoreQuestionnaire(quiz, answersFor(counts)); if (result.status !== "complete" || !("loveType16" in result)) throw new Error("result");
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLoveType16Report quiz={quiz} result={result} locale={locale} />);
        expect(dom.querySelectorAll("[data-love-axis]")).toHaveLength(4); expect(dom.querySelectorAll("[data-love-profile]")).toHaveLength(result.compatibleProfileIds.length);
        for (const id of result.compatibleProfileIds) {
          const el = dom.querySelector(`[data-love-profile='${id}']`)!;
          for (const s of quiz.profiles.find(p => p.id === id)!.sections) for (const t of s.paragraphs) expect(el.textContent).toContain(t[locale]);
        }
      }
    }
  });
});
