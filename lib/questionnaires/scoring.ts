import { isScs26ConfigurationValid, scoreScs26Questionnaire } from "./scs26";
import { isCbiConfigurationValid, scoreCbiQuestionnaire } from "./cbi";
import { isRosenbergConfigurationValid, scoreRosenbergQuestionnaire } from "./rosenberg";
import { isPoliticalCoordinatesConfigurationValid, scorePoliticalCoordinatesQuestionnaire } from "./politicalCoordinates";
import { isDataEntryConfigurationValid } from "./dataEntry";
import { isSecsConfigurationValid, scoreSecsQuestionnaire } from "./secs";
import { isPairedDimensionsConfigurationValid, scorePairedDimensionsQuestionnaire } from "./pairedDimensions";
import { isTypingConfigurationValid } from "./typing";
import { isEightValuesConfigurationValid, scoreEightValuesQuestionnaire } from "./eightValues";
import { isPracticeConfigurationValid, scorePracticeQuestionnaire } from "./practice";
import { isTenKeyConfigurationValid } from "./tenKey";
import { isCompassConfigurationValid, scoreCompassQuestionnaire } from "./compass";
import { isOptimismConfigurationValid, scoreOptimismQuestionnaire } from "./optimism";
import type { Questionnaire, QuestionnaireAnswers } from "./types";
import { isAttachmentConfigurationValid, scoreAttachmentQuestionnaire } from "./attachment";
import { isAffectionConfigurationValid, scoreAffectionQuestionnaire } from "./affection";
import { isAlignmentConfigurationValid, scoreAlignmentQuestionnaire } from "./alignment";
import { isExtraversionConfigurationValid, scoreExtraversionQuestionnaire } from "./extraversion";

export type DirectionalResult = {
  status: "incomplete" | "invalid" | "unavailable";
  answered: number;
} | {
  status: "complete";
  answered: number;
  counts: Record<string, number>;
  leaders: string[];
  profileId: string;
};
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const key = (ids: string[]) => [...ids].sort().join("|");

export function isDirectionalConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "directional" || !quiz.questions.length || quiz.directions.length < 2) return false;
  const directions = new Set(quiz.directions.map(d => d.id));
  if (directions.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (question.options.length !== 2 || new Set(question.options.map(o => o.id)).size !== 2 || new Set(question.options.map(o => o.directionId)).size !== 2) return false;
    for (const option of question.options) {
      if (!directions.has(option.directionId)) return false;
      exposure[option.directionId]++;
    }
  }
  if (quiz.directions.some(d => exposure[d.id] !== d.comparisons)) return false;
  const combinations = quiz.profiles.map(p => key(p.directionIds));
  return new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && new Set(combinations).size === quiz.profiles.length
    && quiz.profiles.every(p => p.directionIds.length > 0 && new Set(p.directionIds).size === p.directionIds.length && p.directionIds.every(id => directions.has(id)));
}

export function scoreDirectionalQuestionnaire(quiz: Questionnaire, answers: unknown): DirectionalResult {
  if (!isDirectionalConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++;
    answered++;
  }
  // Partial counts never produce a ranked or interpreted result.
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const highest = Math.max(...Object.values(counts));
  const leaders = quiz.directions.filter(d => counts[d.id] === highest).map(d => d.id);
  const profile = quiz.profiles.find(p => key(p.directionIds) === key(leaders));
  return profile ? { status: "complete", answered, counts, leaders, profileId: profile.id } : { status: "unavailable", answered };
}

export type FacetScore = { sum: number; rated: number; total: number; mean: number | null };
export type FacetResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; facets: Record<string, FacetScore>;
};

export function isLikertConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "likert" || !quiz.instructions || !quiz.questions.length || !quiz.directions.length
    || !Number.isInteger(quiz.minimumRatedItems) || quiz.minimumRatedItems! < 1) return false;
  const ids = new Set(quiz.directions.map(d => d.id));
  if (ids.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (typeof question.reverse !== "boolean" || question.options.length !== 6
      || new Set(question.options.map(o => o.id)).size !== 6
      || new Set(question.options.map(o => o.directionId)).size !== 1) return false;
    const id = question.options[0].directionId;
    if (!ids.has(id)) return false;
    for (const option of question.options) {
      if (option.id === "na" ? option.score !== null
        : !/^[1-5]$/.test(option.id) || option.score !== Number(option.id)) return false;
    }
    exposure[id]++;
  }
  return quiz.directions.every(d => Number.isInteger(d.itemCount) && d.itemCount! >= quiz.minimumRatedItems! && exposure[d.id] === d.itemCount)
    && quiz.profiles.length === quiz.directions.length
    && new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && quiz.directions.every(d => quiz.profiles.filter(p => p.directionIds.length === 1 && p.directionIds[0] === d.id).length === 1);
}

export function scoreLikertQuestionnaire(quiz: Questionnaire, answers: unknown): FacetResult {
  if (!isLikertConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const facets: Record<string, FacetScore> = Object.fromEntries(quiz.directions.map(d => [d.id, { sum: 0, rated: 0, total: d.itemCount!, mean: null }]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    const score = option.score;
    if (typeof score === "number") {
      const facet = facets[option.directionId];
      facet.sum += question.reverse ? 6 - score : score;
      facet.rated++;
    }
    answered++;
  }
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  for (const facet of Object.values(facets)) {
    if (facet.rated >= quiz.minimumRatedItems!) facet.mean = Math.round(facet.sum / facet.rated * 10) / 10;
  }
  return { status: "complete", answered, facets };
}

export type ArchetypeResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; counts: Record<string, number>; profileIds: string[];
};

export function isArchetypeConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "archetype" || !quiz.instructions || !quiz.questions.length || quiz.directions.length < 2) return false;
  const ids = new Set(quiz.directions.map(d => d.id));
  if (ids.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (question.options.length !== 4 || new Set(question.options.map(o => o.id)).size !== 4
      || new Set(question.options.map(o => o.directionId)).size !== 4) return false;
    for (const option of question.options) {
      if (!ids.has(option.directionId) || option.score !== undefined) return false;
      exposure[option.directionId]++;
    }
  }
  const comparisons = quiz.directions[0].comparisons;
  return Number.isInteger(comparisons) && comparisons! > 0
    && quiz.directions.every(d => d.comparisons === comparisons && exposure[d.id] === comparisons)
    && quiz.profiles.length === quiz.directions.length
    && new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && quiz.directions.every(d => quiz.profiles.filter(p => p.directionIds.length === 1 && p.directionIds[0] === d.id).length === 1);
}

export function scoreArchetypeQuestionnaire(quiz: Questionnaire, answers: unknown): ArchetypeResult {
  if (!isArchetypeConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const highest = Math.max(...Object.values(counts));
  return { status: "complete", answered, counts, profileIds: quiz.profiles.filter(p => counts[p.directionIds[0]] === highest).map(p => p.id) };
}

export const isQuestionnaireConfigurationValid = (quiz: Questionnaire) => quiz.kind === "scs26" ? isScs26ConfigurationValid(quiz) : quiz.kind === "cbi" ? isCbiConfigurationValid(quiz) : quiz.kind === "rosenberg" ? isRosenbergConfigurationValid(quiz) : quiz.kind === "political-coordinates" ? isPoliticalCoordinatesConfigurationValid(quiz) : quiz.kind === "data-entry" ? isDataEntryConfigurationValid(quiz) : quiz.kind === "secs" ? isSecsConfigurationValid(quiz) : quiz.kind === "paired-dimensions" ? isPairedDimensionsConfigurationValid(quiz) : quiz.kind === "typing" ? isTypingConfigurationValid(quiz) : quiz.kind === "eight-values" ? isEightValuesConfigurationValid(quiz) : quiz.kind === "ten-key" ? isTenKeyConfigurationValid(quiz) : quiz.kind === "practice" ? isPracticeConfigurationValid(quiz) : quiz.kind === "compass" ? isCompassConfigurationValid(quiz) : quiz.kind === "optimism" ? isOptimismConfigurationValid(quiz) : quiz.kind === "attachment" ? isAttachmentConfigurationValid(quiz) : quiz.kind === "affection" ? isAffectionConfigurationValid(quiz) : quiz.kind === "extraversion" ? isExtraversionConfigurationValid(quiz) : quiz.kind === "alignment" ? isAlignmentConfigurationValid(quiz) : quiz.kind === "likert"
  ? isLikertConfigurationValid(quiz) : quiz.kind === "archetype" ? isArchetypeConfigurationValid(quiz) : isDirectionalConfigurationValid(quiz);
export const scoreQuestionnaire = (quiz: Questionnaire, answers: unknown) => quiz.kind === "scs26" ? scoreScs26Questionnaire(quiz, answers) : quiz.kind === "cbi" ? scoreCbiQuestionnaire(quiz, answers) : quiz.kind === "rosenberg" ? scoreRosenbergQuestionnaire(quiz, answers) : quiz.kind === "political-coordinates" ? scorePoliticalCoordinatesQuestionnaire(quiz, answers) : quiz.kind === "data-entry" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "secs" ? scoreSecsQuestionnaire(quiz, answers) : quiz.kind === "paired-dimensions" ? scorePairedDimensionsQuestionnaire(quiz, answers) : quiz.kind === "typing" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "eight-values" ? scoreEightValuesQuestionnaire(quiz, answers) : quiz.kind === "ten-key" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "practice" ? scorePracticeQuestionnaire(quiz, answers) : quiz.kind === "compass" ? scoreCompassQuestionnaire(quiz, answers) : quiz.kind === "optimism" ? scoreOptimismQuestionnaire(quiz, answers) : quiz.kind === "attachment" ? scoreAttachmentQuestionnaire(quiz, answers) : quiz.kind === "affection" ? scoreAffectionQuestionnaire(quiz, answers) : quiz.kind === "extraversion" ? scoreExtraversionQuestionnaire(quiz, answers) : quiz.kind === "alignment" ? scoreAlignmentQuestionnaire(quiz, answers) : quiz.kind === "likert"
  ? scoreLikertQuestionnaire(quiz, answers) : quiz.kind === "archetype" ? scoreArchetypeQuestionnaire(quiz, answers) : scoreDirectionalQuestionnaire(quiz, answers);

export function readQuestionnaireDraft(quiz: Questionnaire, raw: string | null, now = Date.now()): QuestionnaireAnswers | null {
  if (!raw || quiz.kind === "typing" || quiz.kind === "data-entry") return null;
  try {
    const draft: unknown = JSON.parse(raw);
    if (!object(draft) || draft.version !== quiz.version || typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) return null;
    const age = now - draft.savedAt;
    if (age < 0 || age >= 24 * 60 * 60 * 1000 || !object(draft.answers)) return null;
    const result = scoreQuestionnaire(quiz, draft.answers);
    return result.status === "complete" || result.status === "incomplete" ? draft.answers as QuestionnaireAnswers : null;
  } catch { return null; }
}
