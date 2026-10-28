import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireCulturalDimensionsReport } from "@/components/questionnaires/QuestionnaireCulturalDimensionsReport";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/cultural-dimensions.json", "utf8")) as Questionnaire;
const H = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answers = (values: string[]) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
const base = Array<string>(36).fill("3");

describe("T062 original36 six culture-related reflection topics, without national indices", () => {
  it("freezes36 original bilingual statements,3direct+3reverse per topic and six complete readings", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.minimumRatedItems).toBe(4);
    expect(H(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(H(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(36); expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(36);
    expect(quiz.directions.map(d => d.id)).toEqual(["authority", "autonomy", "achievement", "certainty", "adaptation", "enjoyment"]);
    for (const d of quiz.directions) {
      const items = quiz.questions.filter(q => q.options[0].directionId === d.id); expect(items).toHaveLength(6); expect(items.map(q => q.reverse)).toEqual([false, false, false, true, true, true]);
    }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(680);
      for (const l of ["en", "zh"] as const) for (const s of p.sections) for (const t of s.paragraphs) expect(t[l].trim().length).toBeGreaterThan(25);
    }
    expect(quiz.profiles.find(p => p.id === "achievement")!.sections[1].paragraphs[0].en).toContain("Read these two sets separately");
  });
  it("recomputes all6x46656 single-topic patterns, excludingNA and withholding means below4numeric, not6^36joint attempts", () => {
    let cases = 0;
    for (let topic = 0; topic < 6; topic++) for (let pattern = 0; pattern < 46656; pattern++) {
      let n = pattern; const values = [...base], contributions: number[] = [];
      for (let j = 0; j < 6; j++) {
        const digit = n % 6; n = Math.floor(n / 6); values[topic * 6 + j] = digit === 5 ? "na" : String(digit + 1);
        if (digit < 5) contributions.push(j < 3 ? digit + 1 : 5 - digit);
      }
      const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw new Error("Valid complete input withheld");
      const sum = contributions.reduce((a, b) => a + b, 0), count = contributions.length, score = r.facets[quiz.directions[topic].id];
      expect(score).toEqual({ sum, rated: count, total: 6, mean: count >= 4 ? Math.round(sum / count * 10) / 10 : null }); cases++;
    }
    expect(cases).toBe(279936);
  }, 45000);
  it("keeps equal means separate, handles allNA without zero, and does not emit a country, total or winner", () => {
    for (const values of [base, Array<string>(36).fill("5"), Array<string>(36).fill("na")]) {
      const r = scoreQuestionnaire(quiz, answers(values)); if (r.status !== "complete" || !("facets" in r)) throw new Error("result");
      expect(Object.keys(r.facets)).toHaveLength(6); expect(Object.values(r.facets).map(f => f.mean)).toEqual(Array(6).fill(values[0] === "na" ? null : 3));
      expect(Object.keys(r).sort()).toEqual(["answered", "facets", "status"]);
      for (const locale of ["en", "zh"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCulturalDimensionsReport quiz={quiz} result={r} answers={answers(values)} locale={locale} />);
        expect(dom.querySelectorAll("[data-cultural-full]")).toHaveLength(6); expect(dom.querySelectorAll("[data-cultural-answer]")).toHaveLength(36);
        for (const p of quiz.profiles) for (const s of p.sections) for (const t of s.paragraphs) expect(dom.querySelector(`[data-cultural-full='${p.id}']`)?.textContent).toContain(t[locale]);
        if (values[0] === "na") expect([...dom.querySelectorAll("[data-cultural-sum]")].map(n => n.textContent)).toEqual(Array(6).fill("—"));
      }
    }
  });
  it("withholds partial inputs and rejects unknown options, keys and malformed configurations", () => {
    const all = answers(base), partial = { ...all }; delete partial.CD_ENJOYMENT_06; expect(scoreQuestionnaire(quiz, partial)).toMatchObject({ status: "incomplete", answered: 35 });
    for (const v of [null, [], "nation", { ...all, bad: "3" }, { ...all, CD_AUTHORITY_01: "6" }, { ...all, CD_AUTHORITY_01: 3 }]) expect(scoreQuestionnaire(quiz, v).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.questions[0].reverse = undefined; }, (q: Questionnaire) => { q.profiles.pop(); }, (q: Questionnaire) => { q.minimumRatedItems = 7; }, (q: Questionnaire) => { q.questions[0].options[5].score = 0; }]) {
      const q = structuredClone(quiz); mutate(q); expect(scoreQuestionnaire(q, all).status).toBe("unavailable");
    }
  });
  it("restores only current-version valid drafts within24hours and never interprets partial stored answers", () => {
    const now = 1_793_000_000_000, a = { CD_AUTHORITY_01: "na", CD_AUTHORITY_02: "4" }, draft = (savedAt: number, version = quiz.version) => JSON.stringify({ answers: a, savedAt, version });
    expect(readQuestionnaireDraft(quiz, draft(now), now)).toEqual(a); expect(scoreQuestionnaire(quiz, a).status).toBe("incomplete");
    for (const raw of [draft(now + 1), draft(now - 86400000), draft(now, "vsm"), "bad", JSON.stringify({ answers: { wrong: "3" }, version: quiz.version, savedAt: now })]) expect(readQuestionnaireDraft(quiz, raw, now)).toBeNull();
  });
});
