import entries from "./portfolioLandingEntries.json";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire, scoreDirectionalQuestionnaire, scoreLikertQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { scoreAttachmentQuestionnaire } from "@/lib/questionnaires/attachment";
import { scoreAffectionQuestionnaire } from "@/lib/questionnaires/affection";
import { scoreAlignmentQuestionnaire } from "@/lib/questionnaires/alignment";
import { scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import { scoreEightValuesQuestionnaire } from "@/lib/questionnaires/eightValues";
import { scoreExtraversionQuestionnaire } from "@/lib/questionnaires/extraversion";
import { scoreLoveType16Questionnaire } from "@/lib/questionnaires/loveType16";
import { scoreOptimismQuestionnaire } from "@/lib/questionnaires/optimism";
import { scorePairedDimensionsQuestionnaire } from "@/lib/questionnaires/pairedDimensions";
import { scoreParentingPracticesQuestionnaire } from "@/lib/questionnaires/parentingPractices";
import { scorePoliticalCoordinatesQuestionnaire } from "@/lib/questionnaires/politicalCoordinates";
import { scoreSecsQuestionnaire } from "@/lib/questionnaires/secs";
import { scorePracticeQuestionnaire } from "@/lib/questionnaires/practice";

export function hasPortfolioLanding(slug: string): boolean {
  return Object.hasOwn(entries, slug);
}

export type PortfolioPreview =
  | { kind: "matches"; profileIds: string[]; scores: { id: string; value: number }[] }
  | { kind: "dimensions"; scores: { id: string; value: number; total: number; min: number }[] }
  | { kind: "data-entry"; profileId: string; fieldAccuracy: number; exactCharacterKph: number }
  | { kind: "practice"; correct: number; total: number; scores: { id: string; value: number; total: number }[] }
  | { kind: "format" };

/** These generated answer sheets are transient and never leave the server. */
export function buildPortfolioPreview(quiz: Questionnaire, sample: number): PortfolioPreview {
  if (quiz.kind === "data-entry") {
    const rounds = quiz.dataEntry?.rounds;
    const round = rounds?.[sample % rounds.length];
    if (!round) return { kind: "format" };
    const rows = round.records.slice(0, 2 + sample * 2).map(record => ({ recordId: record.id, values: record.values }));
    const result = scoreDataEntryRound(round, rows, quiz.dataEntry?.durationMs);
    return result.status === "complete" && result.fieldAccuracy !== null
      ? { kind: "data-entry", profileId: round.profileId, fieldAccuracy: result.fieldAccuracy, exactCharacterKph: result.exactFieldCharacterKph }
      : { kind: "format" };
  }
  const attemptsByDirection = new Map<string, number>();
  const groupSizes = new Map(quiz.directions.map(direction => [direction.id, direction.itemCount ?? 0]));
  const preferred = quiz.directions[sample % quiz.directions.length]?.id;
  const practiceRatio = [0.25, 0.5, 0.8][sample];
  const answers: QuestionnaireAnswers = {};
  for (const [index, question] of quiz.questions.entries()) {
    const first = question.options[0];
    if (!first) return { kind: "format" };
    const direction = quiz.directions.findIndex(item => item.id === first.directionId);
    let selected = question.options.find(option => option.directionId === preferred) ??
      question.options[(index * index + sample) % question.options.length];
    if (question.interaction) {
      const ids = [selected.id, ...question.options.filter(option => option.id !== selected.id).map(option => option.id)];
      answers[question.id] = JSON.stringify(question.interaction === "rank" ? ids : ids.slice(0, question.minimumSelections ?? 1));
      continue;
    }
    if (["attachment", "affection", "parenting-practices", "optimism", "extraversion", "likert"].includes(quiz.kind)) {
      const value = [1, 3, 5][(sample + Math.max(0, direction)) % 3];
      selected = question.options.find(option => option.score === (question.reverse ? 6 - value : value)) ?? selected;
    }
    if (quiz.kind === "political-coordinates") {
      const pair = index % 2 === 0 ? ["left", "right"] : ["communitarian", "liberal"];
      const pole = pair[index % 2 === 0 ? sample % 2 : Number(sample > 0)];
      selected = question.options.find(option => option.directionId === pole) ?? selected;
    }
    if (quiz.kind === "eight-values" || quiz.kind === "secs") {
      const value = quiz.kind === "secs" ? [20, 50, 80][sample] : [-1, 0, 1][sample];
      selected = question.options.find(option => option.score === value) ?? selected;
    }
    if (quiz.kind === "practice") {
      const seen = attemptsByDirection.get(first.directionId) ?? 0;
      attemptsByDirection.set(first.directionId, seen + 1);
      const count = groupSizes.get(first.directionId) ?? 0;
      const correct = seen < Math.round(count * practiceRatio);
      selected = question.options.find(option => (option.id === question.correctOptionId) === correct) ?? selected;
    }
    answers[question.id] = selected.id;
  }

  if (quiz.kind === "archetype" || quiz.kind === "directional") {
    const result = quiz.kind === "archetype" ? scoreArchetypeQuestionnaire(quiz, answers) : scoreDirectionalQuestionnaire(quiz, answers);
    if (result.status !== "complete") return { kind: "format" };
    return { kind: "matches", profileIds: "profileIds" in result ? result.profileIds : [result.profileId],
      scores: Object.entries(result.counts).map(([id, value]) => ({ id, value })) };
  }
  if (quiz.kind !== "practice") return scoreSpecialPreview(quiz, answers);
  const result = scorePracticeQuestionnaire(quiz, answers);
  return result.status === "complete" ? {
    kind: "practice", correct: result.practice.correct, total: result.practice.total,
    scores: Object.entries(result.practice.sections).map(([id, score]) => ({ id, value: score.correct, total: score.total })),
  } : { kind: "format" };
}

function means(scores: Record<string, { mean: number | null }>, min = 1, total = 5): PortfolioPreview {
  return {
    kind: "dimensions",
    scores: Object.entries(scores).flatMap(([id, score]) =>
      score.mean === null ? [] : [{ id, value: score.mean, total, min }]),
  };
}

function matchingProfiles(profileIds: string[]): PortfolioPreview {
  return profileIds.length ? { kind: "matches", profileIds, scores: [] } : { kind: "format" };
}

function scoreSpecialPreview(quiz: Questionnaire, answers: QuestionnaireAnswers): PortfolioPreview {
  switch (quiz.kind) {
    case "likert":
    case "parenting-practices": {
      const result = quiz.kind === "likert" ? scoreLikertQuestionnaire(quiz, answers) : scoreParentingPracticesQuestionnaire(quiz, answers);
      if (result.status === "complete") return means(result.facets);
      break;
    }
    case "affection": {
      const result = scoreAffectionQuestionnaire(quiz, answers);
      if (result.status === "complete") return means(result.affectionFacets);
      break;
    }
    case "attachment": {
      const result = scoreAttachmentQuestionnaire(quiz, answers);
      if (result.status === "complete") return means(result.attachmentAxes);
      break;
    }
    case "secs": {
      const result = scoreSecsQuestionnaire(quiz, answers);
      if (result.status === "complete") return means(result.secsDomains, 0, 100);
      break;
    }
    case "eight-values": {
      const result = scoreEightValuesQuestionnaire(quiz, answers);
      if (result.status === "complete") return means(Object.fromEntries(
        Object.entries(result.eightValuesAxes).map(([id, score]) => [id, { mean: score.percentage }]),
      ), 0, 100);
      break;
    }
    case "extraversion": {
      const result = scoreExtraversionQuestionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.scaleProfileIds);
      break;
    }
    case "optimism": {
      const result = scoreOptimismQuestionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.outlookProfileIds);
      break;
    }
    case "love-type16": {
      const result = scoreLoveType16Questionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.compatibleProfileIds);
      break;
    }
    case "paired-dimensions": {
      const result = scorePairedDimensionsQuestionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.pairedProfileIds);
      break;
    }
    case "political-coordinates": {
      const result = scorePoliticalCoordinatesQuestionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.politicalCoordinateProfileIds);
      break;
    }
    case "alignment": {
      const result = scoreAlignmentQuestionnaire(quiz, answers);
      if (result.status === "complete") return matchingProfiles(result.alignmentIds);
      break;
    }
  }
  return { kind: "format" };
}
