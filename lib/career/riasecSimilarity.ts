import type { RiasecDimension } from "@/lib/riasec/resultAssembler";

export const RIASEC_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;

export function readRiasecProfile(scores: readonly RiasecDimension[]) {
  if (scores.length !== RIASEC_DIMENSIONS.length) return null;
  const byCode = new Map(scores.map(score => [score.code, score]));
  const dimensions = RIASEC_DIMENSIONS.map(code => byCode.get(code));
  if (!dimensions.every(dimension =>
    dimension?.scoreAvailable && Number.isFinite(dimension.score) && dimension.score >= 0 && dimension.score <= 100
  )) return null;

  return dimensions.map(dimension => dimension!.score);
}

export function interestProfile(values: readonly number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const centered = values.map(value => value - mean);
  return { centered, norm: Math.hypot(...centered) };
}

export function interestSimilarity(profile: ReturnType<typeof interestProfile>, values: readonly number[]) {
  // O*NET Interest Profiler Manual, chapter 7. Compare the shape of two six-score profiles.
  const occupation = interestProfile(values);
  if (occupation.norm === 0) return 0;
  const dot = profile.centered.reduce((sum, value, index) => sum + value * occupation.centered[index], 0);
  return Math.round(dot / (profile.norm * occupation.norm) * 1e6);
}

export function compareInterestSimilarity(
  a: { slug: string; similarity: number },
  b: { slug: string; similarity: number },
) {
  return b.similarity - a.similarity || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);
}
