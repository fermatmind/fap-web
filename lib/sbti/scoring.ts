import {
  SBTI_DIMENSIONS,
  type SbtiAnswerMap,
  type SbtiArchetype,
  type SbtiQuestion,
  type SbtiScoreVector,
} from "@/lib/sbti/types";

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

export function cosineSimilarity(a: SbtiScoreVector, b: SbtiScoreVector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const key of SBTI_DIMENSIONS) {
    dot += a[key] * b[key];
    normA += a[key] * a[key];
    normB += b[key] * b[key];
  }

  if (normA <= 0 || normB <= 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function resolveSbtiPrimaryType(
  scores: SbtiScoreVector,
  archetypes: SbtiArchetype[]
): { primary: SbtiArchetype; similarity: number; matchPercent: number } {
  const ranked = archetypes
    .map((item) => ({ item, similarity: cosineSimilarity(scores, item.centroid) }))
    .sort((left, right) => right.similarity - left.similarity);

  const best = ranked[0];
  const similarity = Number(best.similarity.toFixed(4));
  const matchPercent = Math.max(61, Math.min(97, Math.round(60 + similarity * 38)));

  return {
    primary: best.item,
    similarity,
    matchPercent,
  };
}
