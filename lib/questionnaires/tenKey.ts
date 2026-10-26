import type { Questionnaire, Text } from "./types";

export type TenKeyRound = { id: "whole" | "decimals" | "references"; title: Text; values: string[] };
export type TenKeyConfiguration = { durationSeconds: 60; rounds: TenKeyRound[] };
export type TenKeyEntry = { text: string; atMs: number };
export const TEN_KEY_DURATION_MS = 60_000;
const ids = ["whole", "decimals", "references"] as const;
const bilingual = (value: Text | undefined) => Boolean(value && typeof value.en === "string" && value.en.trim() && typeof value.zh === "string" && value.zh.trim());

export function isTenKeyRoundValid(round: TenKeyRound): boolean {
  if (!round || !ids.includes(round.id) || !bilingual(round.title) || !Array.isArray(round.values) || round.values.length !== 240 || new Set(round.values).size !== 240) return false;
  const format = round.id === "whole" ? /^[1-9][0-9]{2,4}$/ : round.id === "decimals" ? /^[0-9]{1,3}\.[0-9]{2}$/ : /^00[0-9]{4}$/;
  return round.values.every(value => typeof value === "string" && format.test(value));
}

export function isTenKeyConfigurationValid(quiz: Questionnaire): boolean {
  const config = quiz.tenKey;
  if (quiz.kind !== "ten-key" || quiz.slug !== "ten-key-test" || !bilingual(quiz.instructions) || !bilingual(quiz.resultHeading)
    || !config || config.durationSeconds !== 60 || !Array.isArray(config.rounds) || config.rounds.length !== 3
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 3 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 3
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 3) return false;
  return config.rounds.every((round, index) => isTenKeyRoundValid(round) && round.id === ids[index]
    && quiz.directions[index]?.id === round.id && quiz.directions[index]?.itemCount === 240
    && quiz.questions[index]?.id === `TENKEY_${index + 1}` && bilingual(quiz.questions[index]?.prompt)
    && Array.isArray(quiz.questions[index]?.options) && quiz.questions[index].options.length === 0
    && quiz.profiles[index]?.id === round.id && bilingual(quiz.profiles[index]?.title)
    && Array.isArray(quiz.profiles[index]?.sections) && quiz.profiles[index].sections.length === 7
    && quiz.profiles[index].sections.every(section => bilingual(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0 && section.paragraphs.every(bilingual)));
}

export function scoreTenKeyRound(round: TenKeyRound, entries: readonly TenKeyEntry[], observedElapsedMs: number) {
  if (!isTenKeyRoundValid(round) || !Array.isArray(entries) || entries.length > round.values.length || !Number.isFinite(observedElapsedMs) || observedElapsedMs < 0) return { status: "unavailable" } as const;
  let previous = 0;
  for (const entry of entries) {
    if (!entry || typeof entry.text !== "string" || entry.text.length > 24 || !/^[0-9.]*$/.test(entry.text)
      || !Number.isFinite(entry.atMs) || entry.atMs < previous || entry.atMs >= TEN_KEY_DURATION_MS || entry.atMs > observedElapsedMs) return { status: "unavailable" } as const;
    previous = entry.atMs;
  }
  if (observedElapsedMs < TEN_KEY_DURATION_MS) return { status: "incomplete" } as const;
  const rows = entries.map((entry, index) => {
    const expected = round.values[index];
    return { expected, entered: entry.text, correct: expected === entry.text,
      matchingCharacters: [...expected].filter((character, position) => character === entry.text[position]).length,
      comparedCharacters: Math.max(expected.length, entry.text.length) };
  });
  const confirmedCharacters = rows.reduce((sum, row) => sum + row.entered.length, 0);
  const correctEntries = rows.filter(row => row.correct).length;
  const correctEquivalents = rows.reduce((sum, row) => sum + (row.correct ? row.expected.length + 1 : 0), 0);
  const correctCharacters = rows.reduce((sum, row) => sum + row.matchingCharacters, 0);
  const comparedCharacters = rows.reduce((sum, row) => sum + row.comparedCharacters, 0);
  // Every accepted entry is strictly before the deadline. Callback delay never extends the scoring window.
  const elapsedMs = Math.min(observedElapsedMs, TEN_KEY_DURATION_MS);
  return { status: "complete", elapsedMs, observedElapsedMs, confirmedEntries: rows.length, correctEntries,
    wrongEntries: rows.length - correctEntries, confirmedCharacters, separators: rows.length, correctCharacters, comparedCharacters,
    confirmedKph: (confirmedCharacters + rows.length) * 3_600_000 / elapsedMs,
    exactEntryKph: correctEquivalents * 3_600_000 / elapsedMs,
    entryAccuracy: rows.length ? correctEntries / rows.length * 100 : null,
    entryErrorRate: rows.length ? (rows.length - correctEntries) / rows.length * 100 : null,
    characterAccuracy: comparedCharacters ? correctCharacters / comparedCharacters * 100 : null,
    rows } as const;
}
