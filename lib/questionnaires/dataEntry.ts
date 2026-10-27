import type { Text } from "./types";

export const DATA_ENTRY_DURATION_MS = 60_000;
export type DataEntryField = { id: string; title: Text };
export type DataEntryRecord = { id: string; values: string[] };
export type DataEntryRound = { id: string; title: Text; fields: DataEntryField[]; records: DataEntryRecord[]; profileId: string };
export type DataEntryConfiguration = { durationMs: 60000; rounds: DataEntryRound[] };
export type DataEntryAttemptRow = { recordId: string; values: string[] };
export type DataEntryError = "blank" | "case-spacing" | "transposition" | "omission" | "addition" | "other";
export type DataEntryResult = { status: "invalid" | "incomplete" } | {
  status: "complete"; durationMs: 60000; observedElapsedMs: number; recordsAvailable: number;
  attemptedRecords: number; exactRecords: number; consideredFields: number; exactFields: number;
  enteredCharacters: number; exactFieldCharacters: number; fieldAccuracy: number | null;
  characterKph: number; exactFieldCharacterKph: number; exactFieldsPerHour: number;
  errors: Record<DataEntryError, number>;
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
export const normalizeDataEntryText = (value: string) => value.normalize("NFC");
export function dataEntryCharacters(value: string): string[] {
  return Array.from(new Intl.Segmenter("und", { granularity: "grapheme" }).segment(normalizeDataEntryText(value)), item => item.segment);
}
function validRound(value: unknown): value is DataEntryRound {
  if (!object(value) || typeof value.id !== "string" || !/^[a-z][a-z-]*$/.test(value.id) || !text(value.title) || value.profileId !== value.id
    || !Array.isArray(value.fields) || value.fields.length !== 4 || !Array.isArray(value.records) || value.records.length !== 32) return false;
  if (!value.fields.every(f => object(f) && typeof f.id === "string" && /^[a-z][a-z-]*$/.test(f.id) && text(f.title))
    || new Set(value.fields.map(f => f.id)).size !== 4) return false;
  return value.records.every(r => object(r) && typeof r.id === "string" && /^[A-Z][A-Z0-9_-]{1,30}$/.test(r.id)
    && Array.isArray(r.values) && r.values.length === 4 && r.values.every(v => typeof v === "string" && /^[\x20-\x7e]{1,40}$/.test(v) && v.trim() === v))
    && new Set(value.records.map(r => r.id)).size === 32;
}
export function isDataEntryConfigurationValid(quiz: unknown): boolean {
  if (!object(quiz) || quiz.kind !== "data-entry" || !object(quiz.dataEntry) || quiz.dataEntry.durationMs !== DATA_ENTRY_DURATION_MS
    || typeof Intl.Segmenter !== "function" || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 0
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 2 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 2
    || !Array.isArray(quiz.dataEntry.rounds) || quiz.dataEntry.rounds.length !== 2 || !quiz.dataEntry.rounds.every(validRound)) return false;
  const rounds = quiz.dataEntry.rounds;
  if (new Set(rounds.map(r => r.id)).size !== 2) return false;
  const directions = quiz.directions, profiles = quiz.profiles;
  return rounds.every(round => directions.filter((d: unknown) => object(d) && d.id === round.id && text(d.title)).length === 1
    && profiles.filter((p: unknown) => object(p) && p.id === round.profileId && Array.isArray(p.directionIds)
      && p.directionIds.length === 1 && p.directionIds[0] === round.id && text(p.title) && text(p.scoreReading) && text(p.headline) && text(p.summary)
      && object(p.seo) && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length > 0
      && p.sections.every((section: unknown) => object(section) && typeof section.id === "string" && Boolean(section.id)
        && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0 && section.paragraphs.every(text))
      && new Set(p.sections.map((section: { id: string }) => section.id)).size === p.sections.length).length === 1);
}
const subsequence = (shorter: string[], longer: string[]) => {
  let i = 0; for (const character of longer) if (character === shorter[i]) i++;
  return i === shorter.length;
};
/** First matching description wins; this classifies final strings, not the cause of a person's mistake. */
export function classifyDataEntryError(target: string, entered: string): DataEntryError | null {
  const expected = normalizeDataEntryText(target), actual = normalizeDataEntryText(entered);
  if (expected === actual) return null;
  if (!actual.length) return "blank";
  if (expected.replace(/\s/g, "").toLowerCase() === actual.replace(/\s/g, "").toLowerCase()) return "case-spacing";
  const a = dataEntryCharacters(expected), b = dataEntryCharacters(actual);
  if (a.length === b.length) {
    const different = a.flatMap((v, i) => v === b[i] ? [] : [i]);
    if (different.length === 2 && different[1] === different[0] + 1 && a[different[0]] === b[different[1]] && a[different[1]] === b[different[0]]) return "transposition";
  }
  if (b.length < a.length && subsequence(b, a)) return "omission";
  if (b.length > a.length && subsequence(a, b)) return "addition";
  return "other";
}
/** Final committed fields only. Every explicitly attempted record contributes all four fields, including blanks. */
export function scoreDataEntryRound(round: DataEntryRound, attemptedRows: unknown, observedElapsedMs: unknown): DataEntryResult {
  if (typeof Intl.Segmenter !== "function" || !validRound(round) || !Array.isArray(attemptedRows) || attemptedRows.length > round.records.length
    || typeof observedElapsedMs !== "number" || !Number.isFinite(observedElapsedMs) || observedElapsedMs < 0) return { status: "invalid" };
  const source = new Map(round.records.map(record => [record.id, record])), ids = new Set<string>();
  for (const row of attemptedRows) {
    if (!object(row) || typeof row.recordId !== "string" || !source.has(row.recordId) || ids.has(row.recordId)
      || !Array.isArray(row.values) || row.values.length !== 4 || !row.values.every(v => typeof v === "string" && v.length <= 256
        && !/[\u0000-\u001f\u007f]/.test(v) && dataEntryCharacters(v).length <= 64)) return { status: "invalid" };
    ids.add(row.recordId);
  }
  if (observedElapsedMs < DATA_ENTRY_DURATION_MS) return { status: "incomplete" };
  let exactFields = 0, exactRecords = 0, enteredCharacters = 0, exactFieldCharacters = 0;
  const errors: Record<DataEntryError, number> = { blank: 0, "case-spacing": 0, transposition: 0, omission: 0, addition: 0, other: 0 };
  for (const row of attemptedRows as DataEntryAttemptRow[]) {
    const record = source.get(row.recordId)!; let matched = 0;
    record.values.forEach((target, i) => {
      const actual = normalizeDataEntryText(row.values[i]); enteredCharacters += dataEntryCharacters(actual).length;
      const error = classifyDataEntryError(target, actual);
      if (error === null) { matched++; exactFields++; exactFieldCharacters += dataEntryCharacters(actual).length; } else errors[error]++;
    });
    if (matched === 4) exactRecords++;
  }
  const consideredFields = attemptedRows.length * 4;
  return { status: "complete", durationMs: DATA_ENTRY_DURATION_MS, observedElapsedMs, recordsAvailable: round.records.length,
    attemptedRecords: attemptedRows.length, exactRecords, consideredFields, exactFields, enteredCharacters, exactFieldCharacters,
    fieldAccuracy: consideredFields ? exactFields / consideredFields * 100 : null,
    characterKph: enteredCharacters * 60, exactFieldCharacterKph: exactFieldCharacters * 60, exactFieldsPerHour: exactFields * 60, errors };
}
