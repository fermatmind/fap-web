import { RIASEC_CODES, type Big5TraitKey, type CareerRecommendationJobInput } from "@/lib/career/types";

type CareerJobMapperInput = {
  slug: string;
  title: string;
  summary: string;
  industry_slug: string;
  riasec_vector?: Record<string, unknown>;
  big5_targets?: Record<string, Record<string, unknown>>;
  iq_range?: Record<string, unknown>;
  eq_range?: Record<string, unknown>;
  mbti_primary?: string[];
  mbti_secondary?: string[];
  market_demand?: unknown;
};

const BIG5_TRAITS: Big5TraitKey[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function mapCareerJobToRecommendationInput(job: CareerJobMapperInput): CareerRecommendationJobInput {
  const riasec = (job.riasec_vector ?? {}) as Record<string, unknown>;
  const big5 = (job.big5_targets ?? {}) as Record<string, Record<string, unknown>>;
  const iqRange = (job.iq_range ?? {}) as Record<string, unknown>;
  const eqRange = (job.eq_range ?? {}) as Record<string, unknown>;

  return {
    slug: job.slug,
    title: job.title,
    summary: job.summary,
    industrySlug: job.industry_slug,
    riasecVector: {
      R: clamp(toNumber(riasec.R, 0), 0, 100),
      I: clamp(toNumber(riasec.I, 0), 0, 100),
      A: clamp(toNumber(riasec.A, 0), 0, 100),
      S: clamp(toNumber(riasec.S, 0), 0, 100),
      E: clamp(toNumber(riasec.E, 0), 0, 100),
      C: clamp(toNumber(riasec.C, 0), 0, 100),
    },
    mbtiPrimary: Array.isArray(job.mbti_primary) ? job.mbti_primary : [],
    mbtiSecondary: Array.isArray(job.mbti_secondary) ? job.mbti_secondary : [],
    big5Targets: BIG5_TRAITS.reduce((acc, trait) => {
      const traitNode = (big5[trait] ?? {}) as Record<string, unknown>;
      acc[trait] = {
        min: clamp(toNumber(traitNode.min, 0), 0, 100),
        max: clamp(toNumber(traitNode.max, 100), 0, 100),
      };
      return acc;
    }, {} as CareerRecommendationJobInput["big5Targets"]),
    iqRange: {
      min: clamp(toNumber(iqRange.min, 0), 0, 100),
      max: clamp(toNumber(iqRange.max, 100), 0, 100),
    },
    eqRange: {
      min: clamp(toNumber(eqRange.min, 0), 0, 100),
      max: clamp(toNumber(eqRange.max, 100), 0, 100),
    },
    marketDemand: clamp(toNumber(job.market_demand, 0), 0, 100),
  };
}

export function emptyRiasecVector() {
  return RIASEC_CODES.reduce(
    (acc, code) => {
      acc[code] = 0;
      return acc;
    },
    { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  );
}
