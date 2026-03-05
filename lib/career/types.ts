export const RIASEC_CODES = ["R", "I", "A", "S", "E", "C"] as const;

export type RIASECCode = (typeof RIASEC_CODES)[number];

export type RIASECScoreVector = Record<RIASECCode, number>;

export type Big5TraitKey = "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";

export type Big5ScoreVector = Record<Big5TraitKey, number>;

export type CareerProfileSnapshot = {
  mbtiType?: string;
  big5?: Partial<Big5ScoreVector>;
  iqScore?: number;
  eqScore?: number;
  riasec?: RIASECScoreVector;
  sources: {
    mbti: "history" | "none";
    big5: "history" | "none";
    iq: "history" | "none";
    eq: "history" | "none";
    riasec: "local" | "none";
  };
};

export type CareerRecommendationJobInput = {
  slug: string;
  title: string;
  industrySlug: string;
  summary: string;
  riasecVector: RIASECScoreVector;
  mbtiPrimary: string[];
  mbtiSecondary: string[];
  big5Targets: Record<Big5TraitKey, { min: number; max: number }>;
  iqRange: { min: number; max: number };
  eqRange: { min: number; max: number };
  marketDemand: number;
};

export type CareerRecommendationFactors = {
  interest: number;
  mbti: number;
  big5: number;
  iqEq: number;
  market: number;
};

export type CareerRecommendationResult = {
  jobSlug: string;
  totalScore: number;
  factors: CareerRecommendationFactors;
  why_interest: string;
  why_personality: string;
  why_capability: string;
  risks: string;
};
