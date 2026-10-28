import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireFoodChoiceNextSteps } from "@/components/questionnaires/QuestionnaireFoodChoiceNextSteps";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/food-choice.json", "utf8")) as Questionnaire;
const hash = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const answers = (mask: number) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options[(mask >> i) & 1].id]));

describe("T073 original food presentation comparisons, without a class classifier", () => {
  it("binds12 bilingual original pairs, equal pair/position exposure and all7 complete guides", () => {
    expect(isDirectionalConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(12);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.directions.map(d => d.id)).toEqual(["familiar", "formal", "mix"]);
    const pairs = new Map<string, number>();
    for (const q of quiz.questions) {
      const key = q.options.map(o => o.directionId).sort().join("|"); pairs.set(key, (pairs.get(key) ?? 0) + 1);
      expect(q.reverse).toBeUndefined(); expect(q.options.every(o => o.score === undefined)).toBe(true);
      for (const l of ["en", "zh"] as const) { expect(q.prompt[l]).toBeTruthy(); expect(q.options.every(o => o.label[l])).toBe(true); }
    }
    expect([...pairs.values()]).toEqual([4, 4, 4]);
    for (const d of quiz.directions) {
      expect(d.comparisons).toBe(8);
      expect([0, 1].map(i => quiz.questions.filter(q => q.options[i].directionId === d.id).length)).toEqual([4, 4]);
    }
    expect(quiz.profiles).toHaveLength(7);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(680);
      expect(p.seo!.title.en.length).toBeLessThanOrEqual(65); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
      for (const l of ["en", "zh"] as const) for (const s of p.sections) for (const t of s.paragraphs) expect(t[l].trim().length).toBeGreaterThan(25);
    }
  });
  it("independently recomputes all4096 full answer patterns,61 count vectors and all7 single/tied outcomes", () => {
    const reached = new Set<string>(), vectors = new Set<string>();
    for (let mask = 0; mask < 4096; mask++) {
      const a = answers(mask), counts: Record<string, number> = { familiar: 0, formal: 0, mix: 0 };
      for (const q of quiz.questions) counts[q.options.find(o => o.id === a[q.id])!.directionId]++;
      const top = Math.max(...Object.values(counts)), leaders = quiz.directions.map(d => d.id).filter(id => counts[id] === top);
      const expected = quiz.profiles.find(p => [...p.directionIds].sort().join("|") === [...leaders].sort().join("|"))!;
      const r = scoreQuestionnaire(quiz, a); if (r.status !== "complete" || !("profileId" in r)) throw new Error("Complete pattern rejected");
      expect(r).toEqual({ status: "complete", answered: 12, counts, leaders, profileId: expected.id });
      reached.add(r.profileId); vectors.add(JSON.stringify(counts)); expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(12);
    }
    expect([...reached].sort()).toEqual(quiz.profiles.map(p => p.id).sort()); expect(vectors.size).toBe(61);
    for (const mask of [0, 4095]) expect(scoreQuestionnaire(quiz, answers(mask))).toMatchObject({ status: "complete", profileId: "all-three", counts: { familiar: 4, formal: 4, mix: 4 } });
  });
  it("retains a three-way tie separately from the deliberate-contrast style, with no type or class inference", () => {
    const r = scoreQuestionnaire(quiz, answers(0)); if (r.status !== "complete" || !("profileId" in r)) throw new Error("result");
    expect(r.leaders).toEqual(["familiar", "formal", "mix"]); expect(r.profileId).not.toBe("mix");
    expect(Object.keys(r).sort()).toEqual(["answered", "counts", "leaders", "profileId", "status"]);
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireFoodChoiceNextSteps quiz={quiz} answers={answers(0)} locale={locale} />);
      expect(dom.querySelectorAll("[data-food-choice-answer]")).toHaveLength(12);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-food-choice-answer='${q.id}']`)?.textContent).toContain(q.options[0].label[locale]);
      expect(dom.querySelectorAll('a[href*="/tests/mbti"]')).toHaveLength(0);
      expect(dom.querySelector(`a[href='/${locale}/tests/explore/food-choice#questionnaire-results']`)).not.toBeNull();
    }
  });
  it("withholds partial inputs and rejects unknown answer keys/options or malformed comparison exposure", () => {
    const all = answers(0), partial = { ...all }; delete partial.FC_12;
    expect(scoreQuestionnaire(quiz, partial)).toMatchObject({ status: "incomplete", answered: 11 });
    for (const input of [null, [], "class", { ...all, bad: "A" }, { ...all, FC_01: "C" }, { ...all, FC_01: 1 }]) expect(scoreQuestionnaire(quiz, input).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.directions[0].comparisons = 7; }, (q: Questionnaire) => { q.questions[0].options[1].directionId = q.questions[0].options[0].directionId; }, (q: Questionnaire) => { q.questions[0].options[0].id = q.questions[0].options[1].id; }, (q: Questionnaire) => { q.questions[1].id = q.questions[0].id; }]) {
      const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, all).status).toBe("unavailable");
    }
  });
  it("restores only current-version valid drafts within24hours and keeps stored partial answers uninterpreted", () => {
    const now = 1_793_200_000_000, a = { FC_01: "A", FC_02: "B" }, draft = (savedAt: number, version = quiz.version) => JSON.stringify({ answers: a, savedAt, version });
    expect(readQuestionnaireDraft(quiz, draft(now), now)).toEqual(a); expect(scoreQuestionnaire(quiz, a).status).toBe("incomplete");
    for (const raw of [draft(now + 1), draft(now - 86400000), draft(now, "class35"), "bad", JSON.stringify({ answers: { FC_01: "C" }, savedAt: now, version: quiz.version })]) expect(readQuestionnaireDraft(quiz, raw, now)).toBeNull();
  });
});
