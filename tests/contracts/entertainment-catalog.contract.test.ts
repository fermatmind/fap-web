import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import catalog from "@/lib/entertainment/catalog.json";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { readFunDraft, resolveFunQuiz } from "@/lib/entertainment/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { buildPublicSitemapFamilyMap } from "@/lib/seo/publicSitemap";
import { filterTrackingPayload } from "@/lib/tracking/events";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";

function enumerate(quiz: FunQuiz, answer: Answers = {}, seen = new Set<string>(), questions = new Set<string>(), soloResults = new Set<string>()): number {
  const state = resolveFunQuiz(quiz, answer);
  for (const id of state.path) questions.add(id);
  if (state.complete) { for (const id of state.resultIds) seen.add(id); if (state.resultIds.length === 1) soloResults.add(state.resultIds[0]); return 1; }
  const next = quiz.questions.find(q => q.id === state.path.at(-1))!;
  return next.options.reduce((count, option) => count + enumerate(quiz, { ...answer, [next.id]: option.id }, seen, questions, soloResults), 0);
}

// For long additive questionnaires, equivalent score vectors are merged at
// each question. Multiplicity still accounts for every answer combination;
// the production resolver executes one complete witness per reachable vector.
function coverAdditiveStates(quiz: FunQuiz, seen: Set<string>, questions: Set<string>, soloResults: Set<string>) {
  type State = { scores: number[]; answers: Answers; combinations: number };
  let layer = new Map<string, State>([[quiz.tieOrder.map(() => 0).join(","), { scores: quiz.tieOrder.map(() => 0), answers: {}, combinations: 1 }]]);
  for (const question of quiz.questions) {
    questions.add(question.id);
    const next = new Map<string, State>();
    for (const state of layer.values()) for (const option of question.options) {
      const scores = state.scores.map((score, index) => score + (option.points?.[quiz.tieOrder[index]] ?? 0));
      const key = scores.join(",");
      const existing = next.get(key);
      if (existing) existing.combinations += state.combinations;
      else next.set(key, { scores, answers: { ...state.answers, [question.id]: option.id }, combinations: state.combinations });
    }
    layer = next;
  }
  let combinations = 0;
  for (const state of layer.values()) {
    combinations += state.combinations;
    const actual = resolveFunQuiz(quiz, state.answers);
    expect(actual.complete, quiz.slug).toBe(true);
    expect(actual.scores, quiz.slug).toEqual(Object.fromEntries(quiz.tieOrder.map((id, index) => [id, state.scores[index]])));
    const maximum = Math.max(...state.scores);
    const expected = quiz.tieOrder.filter((_, index) => state.scores[index] === maximum);
    expect(actual.resultIds, quiz.slug).toEqual(expected);
    for (const id of actual.resultIds) seen.add(id);
    if (actual.resultIds.length === 1) soloResults.add(actual.resultIds[0]);
  }
  console.info(`${quiz.slug}: ${combinations} combinations represented by ${layer.size} reachable score vectors; ${layer.size} complete production-resolver witnesses executed.`);
  return combinations;
}

describe("original entertainment catalog", () => {
  it("keeps independent bilingual identities and substantive copy, without duplicate questionnaires", async () => {
    const fingerprints = new Set<string>();
    const blocks = new Set<string>();
    const slugs = new Set<string>();
    for (const card of catalog) {
      const quiz = (await loadFunQuiz(card.slug))!;
      expect(quiz.slug).toBe(card.slug);
      expect(slugs.has(quiz.slug)).toBe(false); slugs.add(quiz.slug);
      expect(quiz.slug).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(quiz.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(quiz.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
      expect(new Set(quiz.questions.map(q => q.id)).size).toBe(quiz.questions.length);
      expect(new Set(quiz.results.map(r => r.id)).size).toBe(quiz.results.length);
      expect([...quiz.tieOrder].sort()).toEqual(quiz.results.map(r => r.id).sort());
      const walkCopy = (value: unknown): void => {
        if (value && typeof value === "object") {
          const record = value as Record<string, unknown>;
          if ("en" in record || "zh" in record) {
            expect(typeof record.en).toBe("string"); expect(typeof record.zh).toBe("string");
            expect(String(record.en).trim().length).toBeGreaterThan(5);
            expect(String(record.zh)).toMatch(/\p{Script=Han}/u);
            expect(String(record.en)).not.toMatch(/\p{Script=Han}|\b(?:TODO|TBD|placeholder|lorem ipsum)\b/u);
          } else Object.values(record).forEach(walkCopy);
        }
      };
      walkCopy(quiz);
      for (const question of quiz.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(question.options.map(o => o.id)).size).toBe(question.options.length);
        for (const option of question.options) {
          if (quiz.mechanism === "tally") {
            expect(Object.keys(option.points ?? {}).length).toBeGreaterThan(0);
            for (const [id, score] of Object.entries(option.points!)) {
              expect(quiz.tieOrder).toContain(id); expect(Number.isInteger(score)).toBe(true); expect(score).toBeGreaterThanOrEqual(0);
            }
            expect(option.next).toBeUndefined(); expect(option.result).toBeUndefined();
          } else {
            expect(Boolean(option.next) !== Boolean(option.result)).toBe(true);
            if (option.next) expect(quiz.questions.some(q => q.id === option.next)).toBe(true);
            if (option.result) expect(quiz.tieOrder).toContain(option.result);
          }
        }
      }
      const fingerprint = JSON.stringify(quiz.questions.map(q => [q.prompt.en, q.options.map(o => o.label.en)]));
      expect(fingerprints.has(fingerprint)).toBe(false); fingerprints.add(fingerprint);
      for (const result of quiz.results) for (const key of ["summary", "example", "strength", "tradeoff", "experiment"] as const) {
        expect(result[key].en.split(/\s+/).length).toBeGreaterThanOrEqual(12);
        expect(blocks.has(result[key].en)).toBe(false); blocks.add(result[key].en);
      }
    }
  });

  it("covers all answer combinations and reaches every authored result and question", async () => {
    let total = 0;
    for (const card of catalog) {
      const quiz = (await loadFunQuiz(card.slug))!;
      const results = new Set<string>(), questions = new Set<string>(), soloResults = new Set<string>();
      const combinations = quiz.questions.reduce((n, q) => n * q.options.length, 1);
      const paths = quiz.mechanism === "tally" && combinations > 100_000
        ? coverAdditiveStates(quiz, results, questions, soloResults)
        : enumerate(quiz, {}, results, questions, soloResults);
      total += paths;
      expect([...results].sort(), quiz.slug).toEqual(quiz.tieOrder.slice().sort());
      expect([...soloResults].sort(), `${quiz.slug}: every portrait must also have an unambiguous witness`).toEqual(quiz.tieOrder.slice().sort());
      expect([...questions].sort(), quiz.slug).toEqual(quiz.questions.map(q => q.id).sort());
      if (quiz.mechanism === "tally") expect(paths).toBe(quiz.questions.reduce((n, q) => n * q.options.length, 1));
    }
    expect(total).toBeGreaterThan(0);
    console.info(`Covered ${total} answer combinations across ${catalog.length} products (${catalog.length * 2} locale entries); small quizzes enumerate paths, long additive quizzes use the score-state coverage reported above.`);
  });

  it.each([
    { slug: "response-color", directions: ["red", "yellow", "blue", "green"], zhHash: "2b0716394b70aa1267adf07c4233624010ca21bfcadf6123fff7e9d8c43ecb62", source: { sourceForm: "personality_color_forced_choice_24", itemBankVersion: "0.1.1-preview", scoringVersion: "0.1.1-preview", itemBankSha256: "c63bf210ef8a755868212f20d77af0f14389041f3effa4cab77ffdee34a911e0" } },
    { slug: "relationship-values", directions: ["romantic_expression", "practical_partnership", "emotional_companionship", "growth_autonomy"], zhHash: "51b475e5ca2c99fe4a168e5661ed7c4db8f493b50dc208f3f9d60682077a5f99", source: { sourceForm: "love_role_forced_choice_24", itemBankVersion: "0.1.0-preview", scoringVersion: "0.1.0-preview", itemBankSha256: "5eb3ba5e9bee03414eecc948fb5812367424a121db94a3fbb69d9f3ab47f54b8" } },
  ])("retains the original mini-preview $slug items, paired schedule, raw wins and ties without norms", async ({ slug, directions, zhHash, source }) => {
    const quiz = (await loadFunQuiz(slug))!;
    expect(quiz.questions).toHaveLength(24);
    expect(quiz.tieOrder).toEqual(directions);
    const pairIndices = [[0,1],[1,0],[0,1],[1,0],[0,2],[2,0],[0,2],[2,0],[0,3],[3,0],[0,3],[3,0],[1,2],[2,1],[1,2],[2,1],[1,3],[3,1],[1,3],[3,1],[2,3],[3,2],[2,3],[3,2]];
    const pairs = pairIndices.map(pair => pair.map(index => directions[index]).join("|"));
    expect(quiz.questions.map(q => q.options.map(o => Object.keys(o.points!)[0]).join("|"))).toEqual(pairs);
    // Canonical Chinese text + option mapping from the frozen original item banks.
    const projection = quiz.questions.map(q => [q.prompt.zh, q.options.map(o => [o.label.zh, Object.keys(o.points!)[0]])]);
    expect(createHash("sha256").update(JSON.stringify(projection)).digest("hex")).toBe(zhHash);
    expect(JSON.parse(readFileSync(`lib/entertainment/data/${slug}.json`, "utf8")).source).toMatchObject(source);
    for (const direction of quiz.tieOrder) {
      expect(quiz.questions.flatMap(q => q.options).filter(o => Object.hasOwn(o.points!, direction))).toHaveLength(12);
    }
    expect(quiz.questions.flatMap(q => q.options).every(o => Object.values(o.points!).length === 1 && Object.values(o.points!)[0] === 1)).toBe(true);
    const allFirst = Object.fromEntries(quiz.questions.map(q => [q.id, q.options[0].id]));
    expect(resolveFunQuiz(quiz, allFirst)).toMatchObject({ scores: Object.fromEntries(directions.map(direction => [direction, 6])), resultIds: quiz.tieOrder });
    expect(quiz.introduction.en).toContain("not the full mini-program report");
    expect(quiz.introduction.en).toContain("no thresholds or population norms");
    expect(quiz.introduction.en).toContain("has not undergone psychometric validation");
    expect(quiz.introduction.zh).toContain("保留全部24道中文题");
  });

  it("recomputes known outcomes, preserves ties, and rejects abnormal answers and identities", async () => {
    const quiz = (await loadFunQuiz("woodland-animal"))!;
    const answers = { q1: "o1", q2: "o2", q3: "o3", q4: "o1", q5: "o2", q6: "o2" };
    expect(resolveFunQuiz(quiz, answers).scores).toEqual({ jay: 6, beaver: 0, hedgehog: 0 });
    expect(resolveFunQuiz(quiz, answers).resultIds).toEqual(["jay"]);
    expect(resolveFunQuiz(quiz, { q1: "o1", q2: "o1", q3: "o1", q4: "o1", q5: "o1", q6: "o1" }).resultIds).toEqual(["jay", "beaver", "hedgehog"]);
    expect(() => resolveFunQuiz(quiz, { q1: "missing" })).toThrow();
    expect(() => resolveFunQuiz(quiz, { unexpected: "o1" })).toThrow();
    expect(isMissingFunRoute("/en/tests/play/not-a-real-quiz")).toBe(true);
    expect(isMissingFunRoute("/en/tests/play/woodland-animal")).toBe(false);
    expect(isMissingFunRoute("/zh/tests/play/woodland-animal/result")).toBe(true);
    expect(isMissingFunRoute("/en/tests/mbti-personality-test-16-personality-types")).toBe(false);
    expect(await loadFunQuiz("__proto__")).toBeNull();
    expect(await loadFunQuiz("../woodland-animal")).toBeNull();
    expect(readFunDraft(quiz, "not JSON")).toBeNull();
    const draft = { version: quiz.version, savedAt: 100000000, answers: { q1: "o1" } };
    expect(readFunDraft(quiz, JSON.stringify(draft), 100000001)).toEqual(draft.answers);
    expect(readFunDraft(quiz, JSON.stringify(draft), 200000000)).toBeNull();
    expect(readFunDraft(quiz, JSON.stringify(draft), draft.savedAt + 86400000)).toBeNull();
    expect(readFunDraft(quiz, JSON.stringify({ ...draft, version: "old" }), 100000001)).toBeNull();
    expect(readFunDraft(quiz, JSON.stringify({ ...draft, answers: { q1: "bad" } }), 100000001)).toBeNull();
  });

  it("publishes bilingual entries and explicit public portrait guides, and retains backend families", () => {
    const base = [{ loc: "https://fermatmind.com/en/career", lastmod: "2026-10-01" }];
    const entries = appendFunSitemapEntries(base);
    const publicCount = [...catalog.filter(card => !questionnaires.some(native => native.slug === card.slug)), ...questionnaires].reduce((total, card) => total + 2 * (1 + card.resultSlugs.length), 0);
    expect(entries).toHaveLength(1 + publicCount);
    expect(entries).toContainEqual(base[0]);
    expect(appendFunSitemapEntries(entries)).toEqual(entries);
    for (const card of catalog.filter(card => !questionnaires.some(native => native.slug === card.slug))) for (const locale of ["en", "zh"]) {
      expect(entries).toContainEqual({ loc: `https://fermatmind.com/${locale}/tests/play/${card.slug}`, lastmod: `${card.updated}T00:00:00.000Z` });
      for (const slug of card.resultSlugs) expect(entries).toContainEqual({ loc: `https://fermatmind.com/${locale}/tests/play/${card.slug}/results/${slug}`, lastmod: `${card.updated}T00:00:00.000Z` });
    }
    for (const card of questionnaires) for (const locale of ["en", "zh"]) {
      const path = `https://fermatmind.com/${locale}/tests/${card.collection}/${card.slug}`;
      expect(entries).toContainEqual({ loc: path, lastmod: `${card.updated}T00:00:00.000Z` });
      for (const profile of card.resultSlugs) expect(entries).toContainEqual({ loc: `${path}/results/${profile}`, lastmod: `${card.updated}T00:00:00.000Z` });
    }
    expect(buildPublicSitemapFamilyMap(entries).tests).toHaveLength(publicCount);
    expect(entries.every(entry => !/[?#]|\/result\//.test(entry.loc))).toBe(true);
    expect(entries.filter(entry => entry.loc.includes("/results/")).every(entry => /^https:\/\/fermatmind\.com\/(?:en|zh)\/tests\/(?:play|explore)\/[^/]+\/results\/[^/]+$/.test(entry.loc))).toBe(true);
  });

  it("keeps questions out of the hub and uses existing consent-filtered tracking with a stable public product key", () => {
    const source = readFileSync("components/entertainment/MoreTests.tsx", "utf8");
    expect(source).not.toContain("/data/"); expect(source).not.toContain("use client");
    const event = filterTrackingPayload("view_result", { scale_code: "ENTERTAINMENT", form_code: "fun_woodland-animal_v1", test_type: "entertainment", answers: ["o1"], result: "jay", private_text: "secret" });
    expect(event).toMatchObject({ scale_code: "ENTERTAINMENT", form_code: "fun_woodland-animal_v1", test_type: "entertainment" });
    expect(event).not.toHaveProperty("answers"); expect(event).not.toHaveProperty("result"); expect(event).not.toHaveProperty("private_text");
  });
});
