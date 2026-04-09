import type { Locale } from "@/lib/i18n/locales";

export const SBTI_STORAGE_KEY = "fm_sbti_fun_v1";

export const SBTI_DIMENSIONS = [
  "social_drive",
  "expression_directness",
  "novelty_seeking",
  "boundary_awareness",
  "emotional_openness",
  "playfulness",
  "stability",
  "initiative",
  "signal_sensitivity",
  "group_energy",
  "reflection",
  "aesthetic_showcase",
  "ambiguity_tolerance",
  "warmth",
  "rhythm_control",
] as const;

export type SbtiDimensionKey = (typeof SBTI_DIMENSIONS)[number];
export const SBTI_RESULT_DIMENSION_KEYS = [
  "S1",
  "S2",
  "S3",
  "E1",
  "E2",
  "E3",
  "A1",
  "A2",
  "A3",
  "Ac1",
  "Ac2",
  "Ac3",
  "So1",
  "So2",
  "So3",
] as const;

export type SbtiResultDimensionKey = (typeof SBTI_RESULT_DIMENSION_KEYS)[number];
export type SbtiBand = "L" | "M" | "H";
export const SBTI_RAW_TYPE_CODES = [
  "IMSB",
  "BOSS",
  "MUM",
  "FAKE",
  "DEAD",
  "ZZZZ",
  "GOGO",
  "FUCK",
  "CTRL",
  "HHHH",
  "SEXY",
  "OJBK",
  "POOR",
  "OH-NO",
  "MONK",
  "SHIT",
  "THAN-K",
  "MALO",
  "ATM",
  "THIN-K",
  "SOLO",
  "LOVE-R",
  "WOC",
  "DRUNK",
  "IMFW",
] as const;

export type SbtiRawTypeCode = (typeof SBTI_RAW_TYPE_CODES)[number];
export type SbtiRiskLevel = "low" | "medium" | "high" | "extreme";
export type SbtiLaunchStatus = "launch" | "rename" | "hold";

export type SbtiAnswerValue = 1 | 2 | 3 | 4 | 5;
export type SbtiAnswerMap = Record<string, string>;
export type SbtiScoreVector = Record<SbtiDimensionKey, number>;
export type SbtiResultScoreVector = Record<SbtiResultDimensionKey, number>;

export type SbtiQuestionOption = {
  id: string;
  label: {
    zh: string;
    en: string;
  };
  impacts: Partial<Record<SbtiDimensionKey, number>>;
};

export type SbtiQuestion = {
  id: string;
  order: number;
  prompt: {
    zh: string;
    en: string;
  };
  reverse?: boolean;
  dimensionWeights: Partial<Record<SbtiDimensionKey, number>>;
  options: SbtiQuestionOption[];
};

export type SbtiDimensionDescriptor = {
  key: SbtiDimensionKey;
  label: {
    zh: string;
    en: string;
  };
  leftPole: {
    zh: string;
    en: string;
  };
  rightPole: {
    zh: string;
    en: string;
  };
};

export type SbtiResultDimensionDescriptor = {
  key: SbtiResultDimensionKey;
  nameZh: string;
  group: "S" | "E" | "A" | "Ac" | "So";
};

export type SbtiArchetype = {
  code: string;
  profileCode: SbtiRawTypeCode;
  name: {
    zh: string;
    en: string;
  };
  tagline: {
    zh: string;
    en: string;
  };
  summary: {
    zh: string;
    en: string;
  };
  friendshipTip: {
    zh: string;
    en: string;
  };
  disclaimer: {
    zh: string;
    en: string;
  };
  centroid: SbtiScoreVector;
};

export type SbtiResultProfile = {
  code: SbtiRawTypeCode;
  nameZh: string;
  safeNameZh?: string;
  riskLevel: SbtiRiskLevel;
  launchStatus: SbtiLaunchStatus;
  heroTagline: string;
  summaryNote: string;
  overview: string;
  centroid: SbtiResultScoreVector;
  dimensionCopy: Partial<Record<SbtiResultDimensionKey, string>>;
};

export type SbtiComputedResult = {
  version: 1;
  updatedAt: string;
  locale: Locale;
  answers: SbtiAnswerMap;
  scores: SbtiScoreVector;
  primaryTypeCode: string;
  matchPercent: number;
  similarity: number;
};
