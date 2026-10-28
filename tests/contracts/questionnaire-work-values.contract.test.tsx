import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireWorkValuesReport, QuestionnaireWorkValuesNextSteps } from "@/components/questionnaires/QuestionnaireWorkValuesReport";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/values-assessment.json", "utf8")) as Questionnaire;
const hash = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
const samePosition = (position: number) => Object.fromEntries(quiz.questions.map(q => [q.id, q.options[position].id]));
function verify(answers: QuestionnaireAnswers) {
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) counts[question.options.find(o => o.id === answers[question.id])!.directionId]++;
  const highest = Math.max(...Object.values(counts));
  const expectedIds = quiz.profiles.filter(p => counts[p.directionIds[0]] === highest).map(p => p.id);
  const result = scoreQuestionnaire(quiz, answers);
  expect(result).toEqual({ status: "complete", answered: 30, counts, profileIds: expectedIds });
  return result;
}

describe("original work-values choices, without an occupational-fit inference", () => {
  it("binds30 original four-choice questions, balanced positions and all45 pair co-exposures", () => {
    expect(isArchetypeConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toHaveLength(30); expect(quiz.directions).toHaveLength(10);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const pairs = new Map<string, number>();
    for (const question of quiz.questions) {
      expect(question.options).toHaveLength(4); expect(question.reverse).toBeUndefined();
      expect(question.options.every(o => o.score === undefined)).toBe(true);
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
        const key = [question.options[i].directionId, question.options[j].directionId].sort().join("|");
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
      for (const locale of ["en", "zh"] as const) {
        expect(question.prompt[locale]).toBeTruthy(); expect(question.options.every(o => o.label[locale])).toBe(true);
      }
    }
    expect(pairs.size).toBe(45); expect(new Set(pairs.values())).toEqual(new Set([4]));
    for (const direction of quiz.directions) {
      expect(direction.comparisons).toBe(12);
      expect([0, 1, 2, 3].map(p => quiz.questions.filter(q => q.options[p].directionId === direction.id).length)).toEqual([3, 3, 3, 3]);
    }
    expect(quiz.profiles.map(p => p.id)).toEqual(quiz.directions.map(d => d.id));
    const paragraphs = quiz.profiles.flatMap(p => p.sections.flatMap(s => s.paragraphs.map(t => t.en)));
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(7); expect(profile.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(65); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160);
      for (const locale of ["en", "zh"] as const) for (const s of profile.sections) for (const p of s.paragraphs) expect(p[locale].trim()).toBeTruthy();
    }
  });
  it("recomputes a bounded4096 complete-answer sample and every direction's0to12 count, without claiming4^30 enumeration", () => {
    let seed = 0x31579;
    for (let sample = 0; sample < 4096; sample++) {
      const answers = Object.fromEntries(quiz.questions.map(q => {
        seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
        return [q.id, q.options[(seed >>> 0) % 4].id];
      }));
      verify(answers);
    }
    for (const direction of quiz.directions) for (let selected = 0; selected <= 12; selected++) {
      let appearances = 0;
      const answers = Object.fromEntries(quiz.questions.map(q => {
        const target = q.options.find(o => o.directionId === direction.id);
        const option = target && appearances++ < selected ? target : q.options.find(o => o.directionId !== direction.id)!;
        return [q.id, option.id];
      }));
      const result = verify(answers);
      if (result.status !== "complete" || !("profileIds" in result)) throw new Error("result");
      expect(result.counts[direction.id]).toBe(selected);
      if (selected === 12) expect(result.profileIds).toEqual([direction.id]);
    }
  });
  it("keeps all-ten ties, complete readings and actual shared ranks, with a private thirty-question review", () => {
    for (const position of [0, 1, 2, 3]) {
      const result = verify(samePosition(position));
      if (result.status !== "complete" || !("profileIds" in result)) throw new Error("result");
      expect(Object.values(result.counts)).toEqual(Array(10).fill(3)); expect(result.profileIds).toHaveLength(10);
    }
    const answers = samePosition(0), q = quiz.questions[0]; answers[q.id] = q.options[1].id;
    const result = verify(answers);
    if (result.status !== "complete" || !("profileIds" in result)) throw new Error("result");
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireWorkValuesReport quiz={quiz} result={result} answers={answers} locale={locale} />);
      expect(dom.querySelectorAll("[data-work-value]")).toHaveLength(10);
      for (const direction of quiz.directions) {
        const row = dom.querySelector(`[data-work-value='${direction.id}']`)!;
        const expectedRank = 1 + Object.values(result.counts).filter(c => c > result.counts[direction.id]).length;
        expect(row.querySelectorAll("td")[1]?.textContent).toBe(String(expectedRank));
      }
      expect(dom.querySelectorAll("[data-work-value-reading]")).toHaveLength(1);
      for (const p of quiz.profiles.find(p => p.id === result.profileIds[0])!.sections.flatMap(s => s.paragraphs)) expect(dom.textContent).toContain(p[locale]);
      expect(dom.querySelectorAll("[data-work-value-review] ol > li")).toHaveLength(30);
      expect(dom.querySelectorAll('[data-selected="true"]')).toHaveLength(30); expect(dom.querySelectorAll('[data-selected="false"]')).toHaveLength(90);
      const next = renderToStaticMarkup(<QuestionnaireWorkValuesNextSteps locale={locale} />);
      expect(next).toContain(`/${locale}/tests/explore/values-assessment#questionnaire-results`); expect(next).not.toContain("/tests/mbti");
    }
  });
  it("withholds partial answers, rejects invalid values and fails closed on malformed bank identity or exposure", () => {
    const all = samePosition(0), partial = { ...all }; delete partial.WV_30;
    expect(scoreQuestionnaire(quiz, partial)).toMatchObject({ status: "incomplete", answered: 29 });
    for (const input of [null, [], "job", { ...all, WV_01: "e" }, { ...all, WV_01: 1 }, { ...all, hidden: "a" }]) expect(scoreQuestionnaire(quiz, input).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.directions[0].comparisons = 11; }, (q: Questionnaire) => { q.questions[0].options[1].directionId = q.questions[0].options[0].directionId; }, (q: Questionnaire) => { q.questions[1].id = q.questions[0].id; }, (q: Questionnaire) => { q.profiles[1].directionIds = q.profiles[0].directionIds; }]) {
      const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, all).status).toBe("unavailable");
    }
    const now = 1_793_200_000_000, draft = (version: string, savedAt: number) => JSON.stringify({ answers: partial, version, savedAt });
    expect(readQuestionnaireDraft(quiz, draft(quiz.version, now), now)).toEqual(partial);
    for (const raw of [draft("other", now), draft(quiz.version, now + 1), draft(quiz.version, now - 86400000), "bad"]) expect(readQuestionnaireDraft(quiz, raw, now)).toBeNull();
  });
});
