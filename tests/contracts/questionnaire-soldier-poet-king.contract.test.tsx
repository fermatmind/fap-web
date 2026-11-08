import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { FantasyArchetypeReport } from "@/components/questionnaires/FantasyArchetypeReport";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { directoryDescription } from "@/lib/entertainment/directory";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/soldier-poet-king-quiz.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/soldier-poet-king-original24-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"]; directions: Questionnaire["directions"] };
const sha = (text: string | Buffer) => createHash("sha256").update(text).digest("hex");
const answerCounts = (counts: number[]) => {
  let offset = 0;
  return { SPK_25: JSON.stringify(["A", "B", "C", "D", "E", "F"]), ...Object.fromEntries(counts.flatMap((count, direction) => Array.from({ length: count }, () => {
    const q = source.questions[offset++];
    return [q.id, q.options.find(o => o.directionId === source.directions[direction].id)!.id];
  }))) };
};

describe("original Soldier Poet King 24-scenario edition", () => {
  it("binds its complete bilingual package and equal choice exposure", async () => {
    expect(quiz.questions).toEqual(source.questions); expect(quiz.directions).toEqual(source.directions);
    expect(quiz.source.itemBankSha256).toBe(sha(sourceBytes));
    expect(quiz.source.resultContentSha256).toBe(sha(JSON.stringify({ profiles: quiz.profiles, guide: quiz.guide, faq: quiz.faq })));
    expect(quiz.questions).toHaveLength(25); expect(quiz.profiles).toHaveLength(3);
    expect(isArchetypeConfigurationValid(quiz)).toBe(true);
    for (const d of quiz.directions) for (let position = 0; position < 3; position++) {
      expect(quiz.questions.slice(0, 24).filter(q => q.options[position].directionId === d.id)).toHaveLength(8);
    }
    for (const profile of quiz.profiles) {
      expect(profile.sections).toHaveLength(6);
      for (const section of profile.sections) for (const locale of ["en", "zh"] as const) {
        expect(section.title[locale].length).toBeGreaterThan(3);
        expect(section.paragraphs[0][locale].length).toBeGreaterThan(15);
      }
      expect(readFileSync(`public/images/quiz-portraits/${quiz.slug}/${profile.id}.svg`, "utf8")).toContain('<svg');
    }
    expect((await loadQuestionnaire(quiz.slug))?.source).toEqual(quiz.source);
  });

  it("checks all 325 attainable count triples, including every single and tied winner set", () => {
    const winnerSets = new Set<string>();
    let witnesses = 0;
    for (let soldier = 0; soldier <= 24; soldier++) for (let poet = 0; poet <= 24 - soldier; poet++) {
      const counts = [soldier, poet, 24 - soldier - poet], answers = answerCounts(counts);
      const actual = scoreArchetypeQuestionnaire(quiz, answers);
      if (actual.status !== "complete") throw new Error("Complete witness rejected");
      const expected = quiz.directions.filter((_, i) => counts[i] === Math.max(...counts)).map(d => d.id);
      expect(Object.values(actual.counts)).toEqual(counts.map(n => n + 5)); expect(actual.profileIds).toEqual(expected);
      winnerSets.add(expected.join("|")); witnesses++;
    }
    expect(witnesses).toBe(325); expect(winnerSets.size).toBe(7);
    // This enumerates count outcomes, not all 3^24 answer sequences or psychological validity.
    expect(scoreArchetypeQuestionnaire(quiz, {}).status).toBe("incomplete");
    expect(scoreArchetypeQuestionnaire(quiz, { ...answerCounts([24, 0, 0]), SPK_01: "" }).status).toBe("invalid");
    expect(scoreArchetypeQuestionnaire(quiz, { ...answerCounts([24, 0, 0]), unknown: "A" }).status).toBe("invalid");
    expect(scoreArchetypeQuestionnaire(quiz, { ...answerCounts([8, 8, 8]), SPK_25: JSON.stringify(["A"]) }).status).toBe("incomplete");
    expect(scoreArchetypeQuestionnaire(quiz, { ...answerCounts([8, 8, 8]), SPK_25: JSON.stringify(["A", "A", "B", "C", "D", "E"]) }).status).toBe("invalid");
    const corrupt = structuredClone(quiz); corrupt.questions[0].options[1].directionId = "soldier";
    expect(scoreArchetypeQuestionnaire(corrupt, answerCounts([24, 0, 0])).status).toBe("unavailable");
    const reordered = structuredClone(quiz); reordered.profiles.reverse();
    const tie = scoreArchetypeQuestionnaire(reordered, answerCounts([8, 8, 8]));
    expect(tie.status === "complete" && new Set(tie.profileIds)).toEqual(new Set(["soldier", "poet", "king"]));
  });

  it("recomputes every one of the 720 final ranking orders independently", () => {
    const permutations = (ids: string[]): string[][] => ids.length ? ids.flatMap((id, i) => permutations(ids.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
    const ranking = source.questions.at(-1)!;
    const seen = new Set<string>();
    for (const order of permutations(ranking.options.map(o => o.id))) {
      const expected = { soldier: 8, poet: 8, king: 8 } as Record<string, number>;
      for (let i = 0; i < 6; i++) expected[ranking.options.find(o => o.id === order[i])!.directionId] += 5 - i;
      const actual = scoreArchetypeQuestionnaire(quiz, { ...answerCounts([8, 8, 8]), SPK_25: JSON.stringify(order) });
      if (actual.status !== "complete") throw new Error("Full ranking rejected");
      expect(actual.counts).toEqual(expected);
      expect(Object.values(actual.counts).reduce((a, b) => a + b)).toBe(39);
      expect(actual.profileIds).toEqual(Object.keys(expected).filter(id => expected[id] === Math.max(...Object.values(expected))));
      seen.add(actual.profileIds.join("|"));
    }
    expect(seen.size).toBe(7);
  });

  it.each(["en", "zh"] as const)("renders all tied readings, actual clues and public comparison in %s", locale => {
    const answers = answerCounts([8, 8, 8]), result = scoreArchetypeQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw new Error("Tie unavailable");
    const html = renderToStaticMarkup(<FantasyArchetypeReport quiz={quiz} result={result} answers={answers} locale={locale} />);
    for (const p of quiz.profiles) {
      expect(html).toContain(`data-archetype-match="${p.id}"`);
      for (const s of p.sections) expect(html).toContain(s.title[locale]);
      expect(html).toContain(`/${locale}/tests/explore/${quiz.slug}/results/${p.id}`);
    }
    expect(html).toContain("33.3%"); expect(html).not.toContain("MBTI");
    expect(html).not.toContain("<h2");
    const directory = document.createElement("div");
    directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
    const path = `/${locale}/tests/explore/${quiz.slug}`;
    const card = directory.querySelector(`h4 a[href="${path}"]`)?.closest("article");
    expect(card).not.toBeNull();
    expect(card?.querySelector(".catalog-item-body > p")?.textContent).toBe(directoryDescription(quiz)[locale]);
    expect(card?.querySelector("a.catalog-item-start")?.getAttribute("href")).toBe(path);
    expect(card?.querySelector(".catalog-cover > img")?.getAttribute("src")).toBe(`/images/test-covers/${quiz.slug}.webp`);
    expect(readFileSync(`public/images/test-covers/${quiz.slug}.webp`).toString("ascii", 8, 12)).toBe("WEBP");
    const sitemap = appendFunSitemapEntries([]);
    expect(sitemap.some(row => row.loc.endsWith(`/tests/explore/${quiz.slug}`))).toBe(true);
    for (const p of quiz.profiles) expect(sitemap.some(row => row.loc.endsWith(`/tests/explore/${quiz.slug}/results/${p.id}`))).toBe(true);
  });
});
