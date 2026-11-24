import release from "./interestRelease.json";
import traditionalCopy from "./interestRelease.zh-TW.json";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";

import { RIASEC_DIMENSIONS as dimensions, compareInterestSimilarity, interestProfile, interestSimilarity, readRiasecProfile } from "./riasecSimilarity";

const taiwanCopy: Record<keyof typeof release.careers, { name: string; summary: string }> = traditionalCopy;

export const RIASEC_CAREER_POOL_SIZE = Object.keys(release.careers).length;

const minimumProfileDeviation = 10;

export function rankRiasecCareers(scores: RiasecDimension[], locale: DisplayLocale) {
  const values = readRiasecProfile(scores);
  if (!values) return { state: "unavailable" as const, jobs: [] };

  const profile = interestProfile(values);
  if (profile.norm / Math.sqrt(dimensions.length) < minimumProfileDeviation) {
    return { state: "flat" as const, jobs: [] };
  }

  const leading = [...values].sort((a, b) => b - a)[2];
  const jobs = Object.entries(release.careers).flatMap(([slug, career]) => {
    const similarity = interestSimilarity(profile, career.interestVector);
    if (similarity <= 0) return [];
    const copy = locale === "zh-TW" ? taiwanCopy[slug as keyof typeof release.careers] : career.copy[locale];
    const occupationThreshold = [...career.interestVector].sort((a, b) => b - a)[2];
    const sharedInterests = dimensions.filter((_, index) => values[index] >= leading && career.interestVector[index] >= occupationThreshold);
    return [{ slug, ...copy, similarity, sharedInterests }];
  }).sort(compareInterestSimilarity);

  return { state: "ranked" as const, jobs: jobs.slice(0, 5) };
}
