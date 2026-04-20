import { normalizeSupportedScaleCode, type SupportedScaleCode } from "@/lib/assessmentSlugMap";

type RolloutPaywallMode = "off" | "free_only" | "full";

type ScaleRolloutEnvConfig = {
  enabledEnv: string;
  percentEnv: string;
  commerceEnv?: string;
};

const SCALE_ROLLOUT_ENV: Record<SupportedScaleCode, ScaleRolloutEnvConfig> = {
  MBTI: {
    enabledEnv: "ENABLE_MBTI",
    percentEnv: "ROLLOUT_PERCENT_MBTI",
  },
  BIG5_OCEAN: {
    enabledEnv: "ENABLE_BIG5_OCEAN",
    percentEnv: "ROLLOUT_PERCENT_BIG5_OCEAN",
  },
  ENNEAGRAM: {
    enabledEnv: "ENABLE_ENNEAGRAM",
    percentEnv: "ROLLOUT_PERCENT_ENNEAGRAM",
    commerceEnv: "ENABLE_ENNEAGRAM_COMMERCE",
  },
  SDS_20: {
    enabledEnv: "ENABLE_SDS_20",
    percentEnv: "ROLLOUT_PERCENT_SDS_20",
    commerceEnv: "ENABLE_SDS_20_COMMERCE",
  },
  CLINICAL_COMBO_68: {
    enabledEnv: "ENABLE_CLINICAL_COMBO_68",
    percentEnv: "ROLLOUT_PERCENT_CLINICAL_COMBO_68",
    commerceEnv: "ENABLE_CLINICAL_COMBO_68_COMMERCE",
  },
  IQ_RAVEN: {
    enabledEnv: "ENABLE_IQ_RAVEN",
    percentEnv: "ROLLOUT_PERCENT_IQ_RAVEN",
    commerceEnv: "ENABLE_IQ_RAVEN_COMMERCE",
  },
  EQ_60: {
    enabledEnv: "ENABLE_EQ_60",
    percentEnv: "ROLLOUT_PERCENT_EQ_60",
    commerceEnv: "ENABLE_EQ_60_COMMERCE",
  },
};
export type { SupportedScaleCode } from "@/lib/assessmentSlugMap";

export type ScaleRolloutEnvSnapshot = Record<
  SupportedScaleCode,
  {
    enabled: boolean;
    percent: number;
    commerceEnabled: boolean;
  }
>;

export type ScaleRolloutDecision = {
  scaleCode: SupportedScaleCode | null;
  assessmentEnabled: boolean;
  commerceEnabled: boolean;
  paywallMode: RolloutPaywallMode;
  bucket: number;
  percent: number;
  backendEnabled: boolean;
  envEnabled: boolean;
  percentEnabled: boolean;
  reasons: string[];
};

export type ProductPriorityEnvSnapshot = {
  mbtiPriorityMode: boolean;
  sbtiEnabled: boolean;
  articlesEnabled: boolean;
  topicsEnabled: boolean;
  careerRecommendEnabled: boolean;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parsePercent(value: unknown, fallback = 100): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.floor(parsed)));
}

function readEnvValue(
  env: Record<string, string | undefined>,
  key: string,
  publicKey: string
): string | undefined {
  return env[key] ?? env[publicKey];
}

function normalizeScaleCode(scaleCode: string | null | undefined): SupportedScaleCode | null {
  return normalizeSupportedScaleCode(scaleCode);
}

function resolveBackendEnabled(capabilities: Record<string, unknown> | null | undefined): boolean {
  const node = toRecord(capabilities);
  const rollout = toRecord(node.rollout);
  const enabledRaw = node.enabled_in_prod ?? rollout.enabled_in_prod ?? true;
  return parseBoolean(enabledRaw, true);
}

function resolvePaywallMode(capabilities: Record<string, unknown> | null | undefined): RolloutPaywallMode {
  const node = toRecord(capabilities);
  const rollout = toRecord(node.rollout);
  const normalized = String(node.paywall_mode ?? rollout.paywall_mode ?? "full")
    .trim()
    .toLowerCase();

  if (normalized === "off" || normalized === "free_only" || normalized === "full") {
    return normalized;
  }
  return "full";
}

function hashToBucket(input: string): number {
  let hash = 2166136261;
  for (let idx = 0; idx < input.length; idx += 1) {
    hash ^= input.charCodeAt(idx);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
}

function resolveBucket(scaleCode: SupportedScaleCode, anonId?: string | null): number {
  const seed = `${scaleCode}:${String(anonId ?? "").trim() || "anonymous"}`;
  return hashToBucket(seed);
}

function defaultDecision(): ScaleRolloutDecision {
  return {
    scaleCode: null,
    assessmentEnabled: true,
    commerceEnabled: true,
    paywallMode: "full",
    bucket: 0,
    percent: 100,
    backendEnabled: true,
    envEnabled: true,
    percentEnabled: true,
    reasons: [],
  };
}

export function createScaleRolloutEnvSnapshot(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): ScaleRolloutEnvSnapshot {
  return (Object.keys(SCALE_ROLLOUT_ENV) as SupportedScaleCode[]).reduce((acc, scaleCode) => {
    const config = SCALE_ROLLOUT_ENV[scaleCode];
    const enabled = parseBoolean(env[config.enabledEnv], true);
    const percent = parsePercent(env[config.percentEnv], 100);
    const commerceEnabled = config.commerceEnv ? parseBoolean(env[config.commerceEnv], true) : true;

    acc[scaleCode] = {
      enabled,
      percent,
      commerceEnabled,
    };
    return acc;
  }, {} as ScaleRolloutEnvSnapshot);
}

export function createProductPriorityEnvSnapshot(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): ProductPriorityEnvSnapshot {
  const mbtiPriorityMode = parseBoolean(
    readEnvValue(env, "MBTI_PRIORITY_MODE", "NEXT_PUBLIC_MBTI_PRIORITY_MODE"),
    false
  );
  const sbtiEnabled = parseBoolean(readEnvValue(env, "SBTI_ENABLED", "NEXT_PUBLIC_SBTI_ENABLED"), true);
  const articlesEnabled = parseBoolean(
    readEnvValue(env, "ARTICLES_ENABLED", "NEXT_PUBLIC_ARTICLES_ENABLED"),
    true
  );
  const topicsEnabled = parseBoolean(readEnvValue(env, "TOPICS_ENABLED", "NEXT_PUBLIC_TOPICS_ENABLED"), true);
  const careerRecommendEnabled = parseBoolean(
    readEnvValue(env, "CAREER_RECOMMEND_ENABLED", "NEXT_PUBLIC_CAREER_RECOMMEND_ENABLED"),
    true
  );

  if (!mbtiPriorityMode) {
    return {
      mbtiPriorityMode,
      sbtiEnabled,
      articlesEnabled,
      topicsEnabled,
      careerRecommendEnabled,
    };
  }

  return {
    mbtiPriorityMode,
    sbtiEnabled: false,
    articlesEnabled: false,
    topicsEnabled: false,
    careerRecommendEnabled: false,
  };
}

export function resolveScaleRollout({
  scaleCode,
  capabilities,
  anonId,
  envSnapshot = createScaleRolloutEnvSnapshot(),
}: {
  scaleCode?: string | null;
  capabilities?: Record<string, unknown> | null;
  anonId?: string | null;
  envSnapshot?: ScaleRolloutEnvSnapshot;
}): ScaleRolloutDecision {
  const normalizedScaleCode = normalizeScaleCode(scaleCode);
  if (!normalizedScaleCode) {
    return defaultDecision();
  }

  const envConfig = envSnapshot[normalizedScaleCode];
  const backendEnabled = resolveBackendEnabled(capabilities);
  const paywallMode = resolvePaywallMode(capabilities);
  const bucket = resolveBucket(normalizedScaleCode, anonId);
  const percentEnabled = bucket < envConfig.percent;
  const envEnabled = envConfig.enabled;
  const assessmentEnabled = backendEnabled && envEnabled && percentEnabled && paywallMode !== "off";
  const commerceEnabled = assessmentEnabled && paywallMode === "full" && envConfig.commerceEnabled;

  const reasons: string[] = [];
  if (!backendEnabled) reasons.push("backend_disabled");
  if (!envEnabled) reasons.push("env_disabled");
  if (!percentEnabled) reasons.push("percent_filtered");
  if (paywallMode === "off") reasons.push("paywall_off");
  if (assessmentEnabled && !commerceEnabled) reasons.push("commerce_disabled");

  return {
    scaleCode: normalizedScaleCode,
    assessmentEnabled,
    commerceEnabled,
    paywallMode,
    bucket,
    percent: envConfig.percent,
    backendEnabled,
    envEnabled,
    percentEnabled,
    reasons,
  };
}
