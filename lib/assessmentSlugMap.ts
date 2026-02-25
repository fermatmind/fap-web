export const SCALE_CANONICAL_SLUG_MAP = {
  MBTI: "mbti-personality-test-16-personality-types",
  BIG5_OCEAN: "big-five-personality-test-ocean-model",
  CLINICAL_COMBO_68: "clinical-depression-anxiety-assessment-professional-edition",
  SDS_20: "depression-screening-test-standard-edition",
  IQ_RAVEN: "iq-test-intelligence-quotient-assessment",
  EQ_60: "eq-test-emotional-intelligence-assessment",
} as const;

export type SupportedScaleCode = keyof typeof SCALE_CANONICAL_SLUG_MAP;

export const TEST_SLUG_ALIAS_MAP: Record<string, string> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: SCALE_CANONICAL_SLUG_MAP.MBTI,
  "personality-mbti-test": SCALE_CANONICAL_SLUG_MAP.MBTI,
  "mbti-test": SCALE_CANONICAL_SLUG_MAP.MBTI,
  "mbti-personality-test": SCALE_CANONICAL_SLUG_MAP.MBTI,
  mbti: SCALE_CANONICAL_SLUG_MAP.MBTI,

  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  "big-five-personality-test": SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  "big5-ocean-test": SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  "big5-ocean": SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  big5: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  "big5-personality-test": SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,

  [SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68]: SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,
  "clinical-combo-68": SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,
  "depression-anxiety-combo": SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,

  [SCALE_CANONICAL_SLUG_MAP.SDS_20]: SCALE_CANONICAL_SLUG_MAP.SDS_20,
  "sds-20": SCALE_CANONICAL_SLUG_MAP.SDS_20,
  "zung-self-rating-depression-scale": SCALE_CANONICAL_SLUG_MAP.SDS_20,

  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  "iq-test": SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  "iq_raven": SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  "raven-iq-test": SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  "raven-matrices": SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,

  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: SCALE_CANONICAL_SLUG_MAP.EQ_60,
  "eq-test": SCALE_CANONICAL_SLUG_MAP.EQ_60,
  "emotional-intelligence-test": SCALE_CANONICAL_SLUG_MAP.EQ_60,
};

const SUPPORTED_SCALE_CODES = new Set<SupportedScaleCode>(
  Object.keys(SCALE_CANONICAL_SLUG_MAP) as SupportedScaleCode[]
);

export function resolveCanonicalSlug(slug: string): string {
  const key = String(slug ?? "").trim().toLowerCase();
  if (!key) return "";
  return TEST_SLUG_ALIAS_MAP[key] ?? key;
}

export function normalizeSupportedScaleCode(scaleCode: string | null | undefined): SupportedScaleCode | null {
  const normalized = String(scaleCode ?? "").trim().toUpperCase();
  if (!normalized) return null;
  return SUPPORTED_SCALE_CODES.has(normalized as SupportedScaleCode) ? (normalized as SupportedScaleCode) : null;
}
