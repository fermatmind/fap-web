import type { Questionnaire, QuestionnaireProfile, Text } from "./types";

/** External candidate only. Two explicitly named symbolic rules; not a validated personality measure. */
export type BirthNumberMethod = "separate-parts" | "all-date-digits";
export type SymbolicBirthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type ReductionStep = { value: number; digits: number[]; sum: number };
export type BirthNumberReduction = { initial: number; steps: ReductionStep[]; value: SymbolicBirthNumber };
export type BirthNumberResult =
  | { status: "input-needed" }
  | { status: "invalid"; reason: "method" | "date-format" | "date-range" | "calendar-date" }
  | { status: "complete"; method: BirthNumberMethod; number: SymbolicBirthNumber; parts: { id: "month" | "day" | "year"; reduction: BirthNumberReduction }[]; initialDigits: number[]; final: BirthNumberReduction };
const masters = new Set([11, 22, 33]);
function reduce(initial: number): BirthNumberReduction {
  let value = initial;
  const steps: ReductionStep[] = [];
  while (value > 9 && !masters.has(value)) {
    const digits = String(value).split("").map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    steps.push({ value, digits, sum });
    value = sum;
  }
  return { initial, steps, value: value as SymbolicBirthNumber };
}
/** Strict proleptic Gregorian date1900..2099. No Date.parse, time-zone inference, randomness or I/O. */
export function calculateBirthNumber(input: unknown, method: unknown): BirthNumberResult {
  if (method !== "separate-parts" && method !== "all-date-digits") return { status: "invalid", reason: "method" };
  if (input === "" || input === undefined || input === null) return { status: "input-needed" };
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return { status: "invalid", reason: "date-format" };
  const [year, month, day] = input.split("-").map(Number);
  if (year < 1900 || year > 2099) return { status: "invalid", reason: "date-range" };
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > monthDays[month - 1]) return { status: "invalid", reason: "calendar-date" };
  if (method === "separate-parts") {
    const parts = ([ ["month", month], ["day", day], ["year", year] ] as const).map(([id, value]) => ({ id, reduction: reduce(value) }));
    const final = reduce(parts.reduce((sum, p) => sum + p.reduction.value, 0));
    return { status: "complete", method, number: final.value, parts, initialDigits: [], final };
  }
  const initialDigits = input.replaceAll("-", "").split("").map(Number);
  const final = reduce(initialDigits.reduce((sum, digit) => sum + digit, 0));
  return { status: "complete", method, number: final.value, parts: [], initialDigits, final };
}

export type BirthNumberConfiguration = {
  methods: { id: BirthNumberMethod; label: Text; description: Text }[];
  endpoints: SymbolicBirthNumber[];
  minYear: 1900;
  maxYear: 2099;
  futurePolicy: "device-calendar-today";
  storagePolicy: "memory-only";
};
export type BirthNumberProfile = QuestionnaireProfile & { symbol: SymbolicBirthNumber; seo: { title: Text; description: Text } };
export type BirthNumberQuestionnaire = Omit<Questionnaire, "kind" | "profiles"> & {
  kind: "birth-number"; birthNumber: BirthNumberConfiguration; profiles: BirthNumberProfile[];
  instructions: Text; resultHeading: Text; references: { title: Text; url: string }[];
};
export type BirthDateNumberResult = BirthNumberResult
  | { status: "unavailable"; reason: "device-date" }
  | { status: "invalid"; reason: "future-date" };
export const BIRTH_NUMBER_SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
export const BIRTH_NUMBER_PROFILE_IDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "eleven", "twenty-two", "thirty-three"] as const;
export const BIRTH_NUMBER_METHODS = ["separate-parts", "all-date-digits"] as const;
const plain = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown) => plain(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());

/** This is a date calculator with no questions or psychological dimensions. */
export function isBirthNumberConfigurationValid(quiz: unknown): quiz is BirthNumberQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "birth-number" || quiz.slug !== "life-path-number" || quiz.code !== "FM_BIRTH_NUMBER_RULES"
    || !plain(quiz.source) || quiz.source.kind !== "fermatmind_original_symbolic_birth_date_rules"
    || quiz.source.formCode !== "fm_birth_number_two_methods_input_rules_v1" || quiz.source.itemBankVersion !== quiz.source.formCode
    || quiz.source.scoringVersion !== "fm_birth_number_parts_digits_keep11_22_33_v1"
    || quiz.source.resultContentVersion !== "fm_birth_number_twelve_editorial_guides_v2"
    || quiz.source.psychometricValidationCompleted !== false
    || typeof quiz.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(quiz.source.itemBankSha256)
    || typeof quiz.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(quiz.source.resultContentSha256)
    || !text(quiz.instructions) || !text(quiz.title) || !text(quiz.description) || !text(quiz.seoTitle)
    || !text(quiz.introduction) || !text(quiz.resultHeading)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 0 || !Array.isArray(quiz.directions) || quiz.directions.length !== 0
    || !plain(quiz.birthNumber) || quiz.birthNumber.minYear !== 1900 || quiz.birthNumber.maxYear !== 2099
    || quiz.birthNumber.futurePolicy !== "device-calendar-today" || quiz.birthNumber.storagePolicy !== "memory-only"
    || !Array.isArray(quiz.birthNumber.methods) || quiz.birthNumber.methods.length !== 2
    || !Array.from(quiz.birthNumber.methods).every((method, index) => plain(method) && method.id === BIRTH_NUMBER_METHODS[index]
      && text(method.label) && text(method.description))
    || !Array.isArray(quiz.birthNumber.endpoints) || quiz.birthNumber.endpoints.length !== 12
    || !Array.from(quiz.birthNumber.endpoints).every((value, index) => value === BIRTH_NUMBER_SYMBOLS[index])
    || !Array.isArray(quiz.guide) || quiz.guide.length !== 4
    || !Array.from(quiz.guide).every((section, index) => plain(section)
      && section.id === [...BIRTH_NUMBER_METHODS, "privacy", "symbolic-scope"][index] && text(section.title)
      && Array.isArray(section.paragraphs) && section.paragraphs.length === 1 && Array.from(section.paragraphs).every(text))
    || !Array.isArray(quiz.faq) || quiz.faq.length !== 6
    || !Array.from(quiz.faq).every(item => plain(item) && text(item.question) && text(item.answer))
    || !Array.isArray(quiz.references) || quiz.references.length !== 2
    || !Array.from(quiz.references).every((reference, index) => plain(reference) && text(reference.title)
      && reference.url === ["https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/", "https://lmp.jp/numerology/soul-number/"][index])
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 12) return false;
  return Array.from(quiz.profiles).every((profile, index) => plain(profile) && profile.id === BIRTH_NUMBER_PROFILE_IDS[index]
    && profile.symbol === BIRTH_NUMBER_SYMBOLS[index] && Array.isArray(profile.directionIds) && profile.directionIds.length === 0
    && text(profile.title) && text(profile.headline) && text(profile.summary) && text(profile.scoreReading)
    && plain(profile.seo) && text(profile.seo.title) && text(profile.seo.description)
    && Array.isArray(profile.sections) && profile.sections.length === 8
    && new Set(Array.from(profile.sections, section => plain(section) ? section.id : null)).size === 8
    && Array.from(profile.sections).every(section => plain(section) && typeof section.id === "string" && Boolean(section.id)
      && text(section.title) && Array.isArray(section.paragraphs) && section.paragraphs.length === 1
      && Array.from(section.paragraphs).every(text)));
}

/** The caller supplies the current device-calendar date;never infer a birth time or zone. */
export function calculateBirthDateNumber(input: unknown, method: unknown, today: unknown): BirthDateNumberResult {
  if (calculateBirthNumber(today, "all-date-digits").status !== "complete") return { status: "unavailable", reason: "device-date" };
  const result = calculateBirthNumber(input, method);
  if (result.status !== "complete") return result;
  if ((input as string) > (today as string)) return { status: "invalid", reason: "future-date" };
  return result;
}

/** Padding explicit month/day fields is the only normalization;overflow and nondecimal text stay invalid. */
export function joinBirthDateFields(year: unknown, month: unknown, day: unknown): string | null {
  if (typeof year !== "string" || typeof month !== "string" || typeof day !== "string"
    || !/^[0-9]{4}$/.test(year) || !/^[0-9]{1,2}$/.test(month) || !/^[0-9]{1,2}$/.test(day)) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function deviceCalendarDate(now = new Date()): string | null {
  if (!Number.isFinite(now.getTime())) return null;
  const value = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return calculateBirthNumber(value, "all-date-digits").status === "complete" ? value : null;
}
