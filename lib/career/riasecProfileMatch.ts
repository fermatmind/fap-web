import release from "./interestRelease.json";
import traditionalCopy from "./interestRelease.zh-TW.json";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";

const taiwanCopy: Record<keyof typeof release.careers, { name: string; summary: string }> = traditionalCopy;

const dimensions = ["R", "I", "A", "S", "E", "C"] as const;
// The result interpretation also treats a population standard deviation below 10 as broad.
const minimumProfileDeviation = 10;

function centered(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map(value => value - mean);
}

export function rankRiasecCareers(scores: RiasecDimension[], locale: DisplayLocale) {
  const byCode = new Map(scores.map(score => [score.code, score]));
  const values = dimensions.map(code => byCode.get(code));
  if (scores.length !== dimensions.length || values.some(score =>
    !score?.scoreAvailable || !Number.isFinite(score.score) || score.score < 0 || score.score > 100)) {
    return { state: "unavailable" as const, jobs: [] };
  }

  const profile = centered(values.map(score => score!.score));
  const profileNorm = Math.hypot(...profile);
  if (profileNorm / Math.sqrt(dimensions.length) < minimumProfileDeviation) {
    return { state: "flat" as const, jobs: [] };
  }

  // O*NET Interest Profiler Manual, chapter 7. Compare the shape of two six-score profiles.
  const jobs = Object.entries(release.careers).flatMap(([slug, career]) => {
    const occupation = centered(career.interestVector);
    const norm = Math.hypot(...occupation);
    if (norm === 0) return [];
    const dot = profile.reduce((sum, value, index) => sum + value * occupation[index], 0);
    const similarity = Math.round(dot / (profileNorm * norm) * 1e6);
    const copy = locale === "zh-TW" ? taiwanCopy[slug as keyof typeof release.careers] : career.copy[locale];
    return similarity > 0 ? [{ slug, ...copy, similarity }] : [];
  }).sort((a, b) => b.similarity - a.similarity || (a.slug < b.slug ? -1 : 1));

  return { state: "ranked" as const, jobs: jobs.slice(0, 5) };
}
