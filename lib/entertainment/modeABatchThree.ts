import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

export const modeABatchThreeTargets = {
  "love-type-16": "preferences",
  "rizz-test": "interaction",
  "communication-style": "interaction",
  "people-pleaser": "boundaries",
  "friendship-compatibility": "interaction",
  "intimacy-values": null,
  "conflict-styles": "interaction",
  "likable-person-test": "boundaries",
  "relationship-preferences": "preferences",
  "connection-ideals": "interaction",
  "love-languages": "interaction",
  "love-fight-style": "interaction",
  "apology-language": "interaction",
  "parenting-style": "interaction",
  "social-battery-test": "boundaries",
  "response-color": "interaction",
  "attachment-styles": "interaction",
  "love-personality": "preferences",
  "relationship-values": "preferences",
  "humor-style-test": "interaction",
  "communication-adaptability": "interaction",
  "relationship-commitment": "preferences",
  "wholesome-partner": "interaction",
  "difficult-person-test": "boundaries",
  "music-taste-test": null,
} as const;

export function isModeABatchThree(slug: string): slug is keyof typeof modeABatchThreeTargets {
  return Object.hasOwn(modeABatchThreeTargets, slug);
}

export const modeABatchThreeAssessments = {
  interaction: { slug: SCALE_CANONICAL_SLUG_MAP.EQ_60, scale: "EQ_60" },
  boundaries: { slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN, scale: "BIG5_OCEAN" },
  preferences: { slug: SCALE_CANONICAL_SLUG_MAP.MBTI, scale: "MBTI" },
} as const;
