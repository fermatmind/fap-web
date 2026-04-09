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
const PROFILE_SPREAD_SCALE = 150;
const PROFILE_SPREAD_POWER = 1.25;
const PROFILE_MISMATCH_WEIGHT = 40;

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

function hashString(value: string): number {
  let hash = 2166136261 >>> 0;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function fingerprintResultScores(scores: SbtiResultScoreVector): string {
  return SBTI_RESULT_DIMENSION_KEYS.map((key) => String(scores[key]).padStart(3, "0")).join("|");
}

function computeSbtiConfidence(mismatchCount: number, distance: number): number {
  const bandCloseness = 1 - mismatchCount / SBTI_RESULT_DIMENSION_KEYS.length;
  const distanceCloseness = 1 - distance / MAX_CENTERED_DISTANCE;

  return Math.max(0, Math.min(1, bandCloseness * 0.7 + distanceCloseness * 0.3));
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
      rankScore: 0,
    }))
    .map((item) => ({
      ...item,
      rankScore: item.mismatchCount * PROFILE_MISMATCH_WEIGHT + item.distance,
    }))
    .sort((left, right) => left.rankScore - right.rankScore);

  const best = ranked[0];
  const confidence = computeSbtiConfidence(best.mismatchCount, best.distance);
  const poolSize = Math.max(
    1,
    Math.min(
      profiles.length,
      1 + Math.floor(Math.pow(1 - confidence, PROFILE_SPREAD_POWER) * PROFILE_SPREAD_SCALE)
    )
  );
  const picked = ranked[hashString(fingerprintResultScores(scores)) % poolSize] ?? best;
  const similarity = Number(
    computeSbtiConfidence(picked.mismatchCount, picked.distance).toFixed(4)
  );
  const matchPercent = Math.max(52, Math.min(96, Math.round(50 + similarity * 46)));

  return {
    primary: picked.item,
    similarity,
    matchPercent,
    mismatchCount: picked.mismatchCount,
    distance: Number(picked.distance.toFixed(4)),
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
