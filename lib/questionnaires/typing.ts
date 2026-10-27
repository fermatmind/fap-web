import type { Text } from "./types";

export const TYPING_DURATION_MS = 60_000;
export type TypingRound = { id: string; language: "en" | "zh"; title: Text; passage: string; profileId: string };
export type TypingConfiguration = { durationMs: 60000; rounds: TypingRound[] };
export type TypingResult = { status: "invalid" | "incomplete" } | {
  status: "complete"; language: "en" | "zh"; durationMs: 60000; observedElapsedMs: number;
  targetCharacters: number; typedCharacters: number; correctCharacters: number; incorrectCharacters: number;
  accuracy: number | null; cpm: number; correctCpm: number; grossWpm: number | null; correctWpm: number | null;
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
export const normalizeTypingText = (value: string) => value.replace(/\r\n?/g, "\n").normalize("NFC");
export function typingCharacters(value: string): string[] {
  return Array.from(new Intl.Segmenter("und", { granularity: "grapheme" }).segment(normalizeTypingText(value)), item => item.segment);
}
export function isTypingConfigurationValid(quiz: unknown): boolean {
  if (!object(quiz) || quiz.kind !== "typing" || !object(quiz.typing) || quiz.typing.durationMs !== TYPING_DURATION_MS
    || typeof Intl.Segmenter !== "function" || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 0
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 2 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 2
    || !Array.isArray(quiz.typing.rounds) || quiz.typing.rounds.length !== 2) return false;
  const rounds = quiz.typing.rounds;
  if (!rounds.every(r => object(r) && typeof r.id === "string" && /^[a-z][a-z-]*$/.test(r.id) && (r.language === "en" || r.language === "zh")
    && text(r.title) && typeof r.passage === "string" && r.passage === normalizeTypingText(r.passage) && r.passage.trim() === r.passage
    && !/[\u0000-\u001f\u007f]/.test(r.passage) && typingCharacters(r.passage).length >= 300 && typingCharacters(r.passage).length <= 5000
    && typeof r.profileId === "string" && r.profileId === r.id)) return false;
  if (new Set(rounds.map(r => r.id)).size !== 2 || new Set(rounds.map(r => r.language)).size !== 2) return false;
  const directions = quiz.directions, profiles = quiz.profiles;
  return rounds.every(round => directions.filter((d: unknown) => object(d) && d.id === round.id && text(d.title)).length === 1
    && profiles.filter((p: unknown) => object(p) && p.id === round.profileId && Array.isArray(p.directionIds)
      && p.directionIds.length === 1 && p.directionIds[0] === round.id && text(p.title) && text(p.scoreReading)
      && text(p.headline) && text(p.summary) && object(p.seo) && text(p.seo.title) && text(p.seo.description)
      && Array.isArray(p.sections) && p.sections.length > 0
      && p.sections.every((section: unknown) => object(section) && typeof section.id === "string" && Boolean(section.id)
        && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0 && section.paragraphs.every(text))
      && new Set(p.sections.map((section: { id: string }) => section.id)).size === p.sections.length).length === 1);
}
/** Final committed buffer only; elapsed must reach the fixed 60-second boundary. This is not a physical-keystroke count. */
export function scoreTypingRound(round: TypingRound, committedText: unknown, observedElapsedMs: unknown): TypingResult {
  if (!object(round) || !["en", "zh"].includes(round.language) || typeof round.passage !== "string" || !round.passage
    || typeof committedText !== "string" || committedText.length > 20_000 || typeof observedElapsedMs !== "number"
    || !Number.isFinite(observedElapsedMs) || observedElapsedMs < 0 || typeof Intl.Segmenter !== "function") return { status: "invalid" };
  if (observedElapsedMs < TYPING_DURATION_MS) return { status: "incomplete" };
  const target = typingCharacters(round.passage), typed = typingCharacters(committedText);
  if (typed.length > target.length) return { status: "invalid" };
  const correct = typed.filter((value, i) => value === target[i]).length;
  return { status: "complete", language: round.language, durationMs: TYPING_DURATION_MS, observedElapsedMs,
    targetCharacters: target.length, typedCharacters: typed.length, correctCharacters: correct, incorrectCharacters: typed.length - correct,
    accuracy: typed.length ? correct / typed.length * 100 : null, cpm: typed.length, correctCpm: correct,
    grossWpm: round.language === "en" ? typed.length / 5 : null, correctWpm: round.language === "en" ? correct / 5 : null };
}
