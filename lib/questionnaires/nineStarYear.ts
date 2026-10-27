import type { Questionnaire, QuestionnaireProfile, Text } from "./types";
import { calculateNineStarYearReference, type NineStarYearResult } from "./nineStarYearMethod";

export const NINE_STAR_PROFILE_IDS = ["one-white-water", "two-black-earth", "three-jade-wood", "four-green-wood", "five-yellow-earth", "six-white-metal", "seven-red-metal", "eight-white-earth", "nine-purple-fire"] as const;
export const NINE_STAR_SIDES = ["before-boundary", "after-boundary", "uncertain"] as const;
export type NineStarYearProfile = QuestionnaireProfile & { star: number; seo: { title: Text; description: Text } };
export type NineStarYearQuestionnaire = Omit<Questionnaire, "kind" | "profiles"> & {
  kind: "nine-star-year";
  nineStarYear: { minYear: 1900; maxYear: 2026; boundarySides: typeof NINE_STAR_SIDES; boundaryTimeZone: "JST+09:00"; boundaryPrecision: "minute"; storagePolicy: "memory-only"; calendarVersion: string };
  profiles: NineStarYearProfile[]; instructions: Text; resultHeading: Text; references: { title: Text; url: string }[];
};
export type NineStarReference = Extract<NineStarYearResult, { status: "reference" }>;
const plain = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown) => plain(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());
const calendarVersion = "NAOJcurrenttheory2.1i_defaultDeltaT_JST9_1900_2026_fetched20261027";
const referenceUrls = ["https://doi.org/10.11501/1102174", "https://eco2.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi", "https://zh.wikisource.org/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/09.07"];

/** This is a bounded cultural calendar utility, with no psychological questions or scores. */
export function isNineStarYearConfigurationValid(quiz: unknown): quiz is NineStarYearQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "nine-star-year" || quiz.slug !== "nine-star-ki" || quiz.code !== "FM_NINE_STAR_YEAR_REFERENCE"
    || !plain(quiz.source) || quiz.source.kind !== "fermatmind_original_cultural_year_reference"
    || quiz.source.formCode !== "fm_nine_star_year_and_boundary_side_v1" || quiz.source.itemBankVersion !== calendarVersion
    || quiz.source.scoringVersion !== "fm_sonoda1927_descending_mod9_jst_boundary_conditional_v1"
    || quiz.source.resultContentVersion !== "fm_nine_star_cultural_full9_reviewed_v1"
    || quiz.source.psychometricValidationCompleted !== false
    || typeof quiz.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(quiz.source.itemBankSha256)
    || typeof quiz.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(quiz.source.resultContentSha256)
    || !text(quiz.title) || !text(quiz.description) || !text(quiz.seoTitle) || !text(quiz.introduction) || !text(quiz.instructions) || !text(quiz.resultHeading)
    || !Array.isArray(quiz.questions) || quiz.questions.length !== 0 || !Array.isArray(quiz.directions) || quiz.directions.length !== 0
    || !plain(quiz.nineStarYear) || quiz.nineStarYear.minYear !== 1900 || quiz.nineStarYear.maxYear !== 2026
    || quiz.nineStarYear.boundaryTimeZone !== "JST+09:00" || quiz.nineStarYear.boundaryPrecision !== "minute"
    || quiz.nineStarYear.storagePolicy !== "memory-only" || quiz.nineStarYear.calendarVersion !== calendarVersion
    || !Array.isArray(quiz.nineStarYear.boundarySides) || quiz.nineStarYear.boundarySides.length !== 3
    || !Array.from(quiz.nineStarYear.boundarySides).every((side, index) => side === NINE_STAR_SIDES[index])
    || !Array.isArray(quiz.guide) || quiz.guide.length !== 4
    || !Array.from(quiz.guide).every((section, index) => plain(section)
      && section.id === ["annual-rule", "boundary-source", "uncertain", "scope-privacy"][index] && text(section.title)
      && Array.isArray(section.paragraphs) && section.paragraphs.length === 1 && Array.from(section.paragraphs).every(text))
    || !Array.isArray(quiz.faq) || quiz.faq.length !== 6 || !Array.from(quiz.faq).every(item => plain(item) && text(item.question) && text(item.answer))
    || !Array.isArray(quiz.references) || quiz.references.length !== 3
    || !Array.from(quiz.references).every((ref, index) => plain(ref) && text(ref.title) && ref.url === referenceUrls[index])
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 9) return false;
  return Array.from(quiz.profiles).every((profile, index) => plain(profile) && profile.id === NINE_STAR_PROFILE_IDS[index]
    && profile.star === index + 1 && Array.isArray(profile.directionIds) && profile.directionIds.length === 0
    && text(profile.title) && text(profile.headline) && text(profile.summary) && text(profile.scoreReading)
    && plain(profile.seo) && text(profile.seo.title) && text(profile.seo.description)
    && Array.isArray(profile.sections) && profile.sections.length === 6
    && Array.from(profile.sections).every((section, i) => plain(section)
      && section.id === NINE_STAR_PROFILE_IDS[index] + (i < 5 ? "-culture-" + (i + 1) : "-source-and-year") && text(section.title)
      && Array.isArray(section.paragraphs) && section.paragraphs.length === (i < 5 ? 1 : 2) && Array.from(section.paragraphs).every(text)));
}

/** UI text is parsed explicitly; the frozen core accepts numeric years only. */
export function calculateNineStarYearFromInput(year: unknown, side: unknown): NineStarYearResult {
  if (year === "" || year === undefined) return { status: "incomplete", field: "year" };
  if (typeof year !== "string" || !/^[0-9]{4}$/.test(year)) return { status: "invalid" };
  return calculateNineStarYearReference(Number(year), side);
}

/** Recompute before rendering, so a partial or inconsistent result never becomes a label. */
export function isNineStarReferenceValid(result: unknown): result is NineStarReference {
  if (!plain(result) || result.status !== "reference" || !Array.isArray(result.candidates)
    || result.candidates.length < 1 || result.candidates.length > 2) return false;
  const first = result.candidates[0];
  if (!plain(first)) return false;
  const side = result.certainty === "two-possibilities" ? "uncertain" : first.side;
  const expected = calculateNineStarYearReference(result.inputYear, side);
  return expected.status === "reference" && result.boundaryJst === expected.boundaryJst && result.precision === expected.precision
    && result.certainty === expected.certainty && result.candidates.length === expected.candidates.length
    && Array.from(result.candidates).every((candidate, index) => plain(candidate) && candidate.seasonYear === expected.candidates[index].seasonYear
      && candidate.star === expected.candidates[index].star && candidate.side === expected.candidates[index].side);
}
