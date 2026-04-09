import { describe, expect, it } from "vitest";
import { SBTI_QUESTIONS } from "@/lib/sbti/questions";
import { SBTI_RESULT_PROFILES } from "@/lib/sbti/results";
import {
  resolveSbtiPrimaryType,
  resolveSbtiProfileFromResultScores,
  scoreSbtiAnswers,
} from "@/lib/sbti/scoring";

function createMulberry32(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("sbti scoring contract", () => {
  it("keeps all 25 result profiles reachable in the active scoring space", () => {
    for (const profile of SBTI_RESULT_PROFILES) {
      const resolved = resolveSbtiProfileFromResultScores(profile.centroid, SBTI_RESULT_PROFILES);
      expect(resolved.primary.code).toBe(profile.code);
      expect(resolved.mismatchCount).toBe(0);
    }
  });

  it("hits all 25 result profiles across 5000 randomized answer samples", () => {
    const random = createMulberry32(20260409);
    const counts = new Map<string, number>();

    for (let index = 0; index < 5000; index += 1) {
      const answers = Object.fromEntries(
        SBTI_QUESTIONS.map((question) => {
          const choiceIndex = Math.floor(random() * question.options.length);
          return [question.id, question.options[choiceIndex]?.id ?? question.options[0]!.id];
        })
      );

      const scores = scoreSbtiAnswers(SBTI_QUESTIONS, answers);
      const resolved = resolveSbtiPrimaryType(scores, SBTI_RESULT_PROFILES);
      counts.set(resolved.primary.code, (counts.get(resolved.primary.code) ?? 0) + 1);
    }

    const distribution = [...counts.values()].sort((left, right) => right - left);
    const dominantShare = (distribution[0] ?? 0) / 5000;

    expect(counts.size).toBe(25);
    expect(dominantShare).toBeLessThan(0.2);
  });
});
