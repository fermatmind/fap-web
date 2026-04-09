import {
  SBTI_DIMENSIONS,
  SBTI_RESULT_DIMENSION_KEYS,
  type SbtiAnswerMap,
  type SbtiQuestion,
  type SbtiResultProfile,
  type SbtiResultScoreVector,
  type SbtiScoreVector,
} from "@/lib/sbti/types";
import { mapSbtiScoreToResultDimensions, toSbtiBand } from "@/lib/sbti/results";

export function createEmptySbtiVector(fill = 0): SbtiScoreVector {
  return SBTI_DIMENSIONS.reduce((acc, key) => {
    acc[key] = fill;
    return acc;
  }, {} as SbtiScoreVector);
}

export function scoreSbtiAnswers(questions: SbtiQuestion[], answers: SbtiAnswerMap): SbtiScoreVector {
  const sums = createEmptySbtiVector(0);
  const counts = createEmptySbtiVector(0);

  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;

    const selected = question.options.find((option) => option.id === answerId);
    if (!selected) continue;

    for (const [dimension, value] of Object.entries(selected.impacts)) {
      if (!dimension || typeof value !== "number") continue;
      const key = dimension as keyof SbtiScoreVector;
      sums[key] += value;
      counts[key] += 1;
    }
  }

  const result = createEmptySbtiVector(50);
  for (const key of SBTI_DIMENSIONS) {
    if (counts[key] > 0) {
      result[key] = Number((sums[key] / counts[key]).toFixed(2));
    }
  }

  return result;
}

const MAX_CENTERED_DISTANCE = Math.sqrt(SBTI_RESULT_DIMENSION_KEYS.length * 100 ** 2);

export function centeredDistance(a: SbtiResultScoreVector, b: SbtiResultScoreVector): number {
  let sum = 0;

  for (const key of SBTI_RESULT_DIMENSION_KEYS) {
    const delta = (a[key] - 50) - (b[key] - 50);
    sum += delta * delta;
  }

  return Math.sqrt(sum);
}

export function getSbtiBandMismatchCount(
  scores: SbtiResultScoreVector,
  profile: SbtiResultProfile
): number {
  return SBTI_RESULT_DIMENSION_KEYS.filter(
    (key) => toSbtiBand(scores[key]) !== toSbtiBand(profile.centroid[key])
  ).length;
}

export function resolveSbtiProfileFromResultScores(
  scores: SbtiResultScoreVector,
  profiles: SbtiResultProfile[]
): {
  primary: SbtiResultProfile;
  similarity: number;
  matchPercent: number;
  mismatchCount: number;
  distance: number;
} {
  const ranked = profiles
    .map((item) => ({
      item,
      mismatchCount: getSbtiBandMismatchCount(scores, item),
      distance: centeredDistance(scores, item.centroid),
    }))
    .sort((left, right) => {
      if (left.mismatchCount !== right.mismatchCount) {
        return left.mismatchCount - right.mismatchCount;
      }

      return left.distance - right.distance;
    });

  const best = ranked[0];
  const bandCloseness = 1 - best.mismatchCount / SBTI_RESULT_DIMENSION_KEYS.length;
  const distanceCloseness = 1 - best.distance / MAX_CENTERED_DISTANCE;
  const similarity = Number((bandCloseness * 0.7 + distanceCloseness * 0.3).toFixed(4));
  const matchPercent = Math.max(52, Math.min(96, Math.round(50 + similarity * 46)));

  return {
    primary: best.item,
    similarity,
    matchPercent,
    mismatchCount: best.mismatchCount,
    distance: Number(best.distance.toFixed(4)),
  };
}

export function resolveSbtiPrimaryType(
  scores: SbtiScoreVector,
  profiles: SbtiResultProfile[]
): {
  primary: SbtiResultProfile;
  similarity: number;
  matchPercent: number;
  mismatchCount: number;
  distance: number;
} {
  return resolveSbtiProfileFromResultScores(mapSbtiScoreToResultDimensions(scores), profiles);
}
