export const SCALE_CODE_V1_TO_V2_MAP = {
  MBTI: "MBTI_PERSONALITY_TEST_16_TYPES",
  BIG5_OCEAN: "BIG_FIVE_OCEAN_MODEL",
  ENNEAGRAM: "ENNEAGRAM_PERSONALITY_TEST",
  CLINICAL_COMBO_68: "CLINICAL_DEPRESSION_ANXIETY_PRO",
  SDS_20: "DEPRESSION_SCREENING_STANDARD",
  IQ_RAVEN: "IQ_INTELLIGENCE_QUOTIENT",
  EQ_60: "EQ_EMOTIONAL_INTELLIGENCE",
} as const;

export type ScaleCodeV1 = keyof typeof SCALE_CODE_V1_TO_V2_MAP;
export type ScaleCodeV2 = (typeof SCALE_CODE_V1_TO_V2_MAP)[ScaleCodeV1];
export type ScaleCodeAny = ScaleCodeV1 | ScaleCodeV2 | (string & {});
export type ScaleCodeMode = "legacy" | "dual" | "v2";

const SCALE_CODE_V2_TO_V1_MAP: Record<ScaleCodeV2, ScaleCodeV1> = {
  MBTI_PERSONALITY_TEST_16_TYPES: "MBTI",
  BIG_FIVE_OCEAN_MODEL: "BIG5_OCEAN",
  ENNEAGRAM_PERSONALITY_TEST: "ENNEAGRAM",
  CLINICAL_DEPRESSION_ANXIETY_PRO: "CLINICAL_COMBO_68",
  DEPRESSION_SCREENING_STANDARD: "SDS_20",
  IQ_INTELLIGENCE_QUOTIENT: "IQ_RAVEN",
  EQ_EMOTIONAL_INTELLIGENCE: "EQ_60",
};

function normalizeScaleCode(scaleCode: string): string {
  return String(scaleCode ?? "").trim().toUpperCase();
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function uniqueScaleCodes(codes: string[]): string[] {
  const seen = new Set<string>();
  return codes.filter((item) => {
    const key = normalizeScaleCode(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolveScaleCodeMode(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): ScaleCodeMode {
  const normalized = String(env.NEXT_PUBLIC_SCALE_CODE_MODE ?? "legacy")
    .trim()
    .toLowerCase();

  if (normalized === "dual" || normalized === "v2") {
    return normalized;
  }
  return "legacy";
}

export function resolveAcceptLegacyScaleCode(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): boolean {
  return parseBoolean(env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE, true);
}

export function toScaleCodeV1(scaleCode: string): string {
  const normalized = normalizeScaleCode(scaleCode);
  if (!normalized) return "";

  if (Object.hasOwn(SCALE_CODE_V1_TO_V2_MAP, normalized)) {
    return normalized;
  }
  return SCALE_CODE_V2_TO_V1_MAP[normalized as ScaleCodeV2] ?? normalized;
}

export function toScaleCodeV2(scaleCode: string): string {
  const normalized = normalizeScaleCode(scaleCode);
  if (!normalized) return "";

  if (Object.hasOwn(SCALE_CODE_V2_TO_V1_MAP, normalized)) {
    return normalized;
  }

  const v1 = toScaleCodeV1(normalized);
  return SCALE_CODE_V1_TO_V2_MAP[v1 as ScaleCodeV1] ?? normalized;
}

export function resolvePreferredScaleCode(
  scaleCode: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): string {
  const mode = resolveScaleCodeMode(env);
  if (mode === "legacy") {
    return toScaleCodeV1(scaleCode);
  }
  return toScaleCodeV2(scaleCode);
}

export function buildRequestScaleCodeCandidates(
  scaleCode: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): string[] {
  const normalized = normalizeScaleCode(scaleCode);
  if (!normalized) return [];

  const mode = resolveScaleCodeMode(env);
  const acceptLegacy = resolveAcceptLegacyScaleCode(env);
  const legacyCode = toScaleCodeV1(normalized);
  const v2Code = toScaleCodeV2(normalized);

  if (mode === "legacy") {
    return uniqueScaleCodes([legacyCode]);
  }

  if (mode === "dual") {
    return uniqueScaleCodes(acceptLegacy ? [v2Code, legacyCode] : [v2Code]);
  }

  return uniqueScaleCodes(acceptLegacy ? [v2Code, legacyCode] : [v2Code]);
}
