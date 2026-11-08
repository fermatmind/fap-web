import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { eightQuizCardRows, eightQuizSlugs } from "@/lib/questionnaires/eightQuizCard";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { scoreSbti31 } from "@/lib/questionnaires/sbti31";
import { scoreLoveType16Questionnaire } from "@/lib/questionnaires/loveType16";
import { scoreAffectionQuestionnaire } from "@/lib/questionnaires/affection";
import { scoreAlignmentQuestionnaire } from "@/lib/questionnaires/alignment";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { EightQuizOverview } from "@/components/questionnaires/EightQuizOverview";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;

describe("eight existing quizzes: aggregate personal cards and public comparison paths", () => {
  it("uses actual complete results, preserves every highest tie and never serialises item answers", () => {
    for (const slug of ["hogwarts-house-quiz", "hazbin-hotel-character-quiz", "hello-kitty", "spirit-animal"]) {
      const q = quiz(slug), answers = Object.fromEntries(q.questions.map((question, index) => [question.id, question.options[index % question.options.length].id]));
      const result = scoreQuestionnaire(q, answers);
      expect(result.status).toBe("complete");
      if (result.status !== "complete" || !("profileIds" in result)) throw new Error("Complete archetype required");
      for (const locale of ["en", "zh"] as const) {
        const rows = eightQuizCardRows(q, result, locale)!;
        expect(rows).toHaveLength(q.directions.length);
        expect(rows.filter(row => row.matched).map(row => row.id).sort()).toEqual(result.profileIds.slice().sort());
        for (const question of q.questions) expect(JSON.stringify(rows)).not.toContain(question.id);
      }
      expect(eightQuizCardRows(q, { status: "incomplete", answered: 0 }, "en")).toBeNull();
    }
  });
  it("keeps all sixteen compatible codes and four axes without assigning a preferred winner", () => {
    const q = quiz("love-type-16"), answers = Object.fromEntries(q.questions.map((question, index) => [question.id, question.options.find(option => option.directionId === (["l", "c", "r", "o"][Math.floor(index / 8)]))!.id]));
    for (let i = 0; i < 32; i++) if (i % 8 >= 4) answers[q.questions[i].id] = q.questions[i].options.find(o => o.id !== answers[q.questions[i].id])!.id;
    const result = scoreLoveType16Questionnaire(q, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Expected complete");
    expect(result.compatibleProfileIds).toHaveLength(16);
    const rows = eightQuizCardRows(q, result, "en")!;
    expect(rows).toHaveLength(20);
    for (const id of result.compatibleProfileIds) expect(rows.find(row => row.id === id)?.matched).toBe(true);
  });
  it("preserves insufficient giving/receiving information rather than making a top type", () => {
    const q = quiz("love-languages");
    const answers = Object.fromEntries(q.questions.map(question => [question.id, question.options.find(o => o.id === "skip")?.id ?? question.options.at(-1)!.id]));
    const result = scoreAffectionQuestionnaire(q, answers);
    expect(result.status).toBe("complete");
    const rows = eightQuizCardRows(q, result, "en")!;
    expect(rows).toHaveLength(5); expect(rows.every(row => !row.matched)).toBe(true);
    expect(rows.every(row => row.detail.includes("Insufficient information"))).toBe(true);
  });
  it("retains every boundary alignment and the four raw endpoint counts", () => {
    const q = quiz("moral-alignment");
    const seen = { lawful: 0, good: 0 };
    const answers = Object.fromEntries(q.questions.map(question => {
      const axis = question.options.some(option => option.directionId === "lawful") ? "lawful" : "good";
      const side = seen[axis]++ < 4 ? axis : axis === "lawful" ? "chaotic" : "evil";
      return [question.id, question.options.find(option => option.directionId === side)!.id];
    }));
    const result = scoreAlignmentQuestionnaire(q, answers);
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Expected complete");
    expect(result.alignmentIds).toHaveLength(4);
    const rows = eightQuizCardRows(q, result, "zh")!;
    expect(rows.filter(row => row.matched).map(row => row.id)).toEqual(result.alignmentIds);
    expect(rows.filter(row => !row.matched)).toHaveLength(4);
  });
  it("renders exactly the selected SBTI portrait without publishing its model vector", () => {
    const q = quiz("sbti-test"), answers = Object.fromEntries(q.questions.map(question => [question.id, question.options[0].id]));
    const result = scoreSbti31(answers); expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Expected complete");
    const rows = eightQuizCardRows(q, result, "en")!;
    expect(rows).toHaveLength(1); expect(rows[0].id).toBe(result.profileId); expect(rows[0].title).toContain(result.profileCode);
    expect(JSON.stringify(rows)).not.toMatch(/matchPercent|presetRarity|dimensionCards/);
  });
  it("exposes bilingual intent copy and same-language full-guide comparisons without changing URLs", () => {
    for (const slug of eightQuizSlugs) for (const locale of ["en", "zh"] as const) {
      const q = quiz(slug), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<EightQuizOverview quiz={q} locale={locale} />);
      expect(dom.querySelector(`[data-eight-quiz-overview="${slug}"]`)).toBeTruthy();
      for (const link of dom.querySelectorAll("a")) { expect(link.getAttribute("href")).toMatch(new RegExp(`^/${locale}/tests/explore/`)); expect(link.getAttribute("target")).toBe("_blank"); }
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
