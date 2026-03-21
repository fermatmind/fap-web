import type { Locale } from "@/lib/i18n/locales";
import type { MbtiLongitudinalMemoryViewModel } from "@/lib/mbti/publicProjection";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => normalizeText(value)).filter(Boolean);
}

function readParam(source: URLSearchParams | SearchParamsRecord, key: string): string {
  if (source instanceof URLSearchParams) {
    return normalizeText(source.get(key));
  }

  const value = source[key];
  return Array.isArray(value) ? normalizeText(value[0]) : normalizeText(value);
}

function splitParam(value: string): string[] {
  return value
    .split("|")
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export type MbtiLongitudinalMemoryQueryViewModel = {
  memoryContractVersion: string;
  memoryFingerprint: string;
  memoryScope: string;
  memoryState: string;
  progressionState: string;
  sectionHistoryKeys: string[];
  behaviorDeltaKeys: string[];
  dominantInterestKeys: string[];
  resumeBiasKeys: string[];
  memoryRewriteKeys: string[];
  memoryRewriteReason: string;
};

export function buildMbtiLongitudinalMemoryQuery(
  memory?: MbtiLongitudinalMemoryViewModel | MbtiLongitudinalMemoryQueryViewModel | null
): Record<string, string> {
  if (!memory) {
    return {};
  }

  const memoryContractVersion = normalizeText(
    "memoryContractVersion" in memory ? memory.memoryContractVersion : "",
    "version" in memory ? memory.version : ""
  );
  const memoryFingerprint = normalizeText(memory.memoryFingerprint);
  const memoryScope = normalizeText(memory.memoryScope);
  const memoryState = normalizeText(memory.memoryState);
  const progressionState = normalizeText(memory.progressionState);
  const sectionHistoryKeys = normalizeStringArray(memory.sectionHistoryKeys);
  const behaviorDeltaKeys = normalizeStringArray(memory.behaviorDeltaKeys);
  const dominantInterestKeys = normalizeStringArray(memory.dominantInterestKeys);
  const resumeBiasKeys = normalizeStringArray(memory.resumeBiasKeys);
  const memoryRewriteKeys = normalizeStringArray(memory.memoryRewriteKeys);
  const memoryRewriteReason = normalizeText(memory.memoryRewriteReason);

  return {
    ...(memoryContractVersion ? { memory_contract_version: memoryContractVersion } : {}),
    ...(memoryFingerprint ? { memory_fingerprint: memoryFingerprint } : {}),
    ...(memoryScope ? { memory_scope: memoryScope } : {}),
    ...(memoryState ? { memory_state: memoryState } : {}),
    ...(progressionState ? { memory_progression_state: progressionState } : {}),
    ...(sectionHistoryKeys.length > 0 ? { section_history_keys: sectionHistoryKeys.join("|") } : {}),
    ...(behaviorDeltaKeys.length > 0 ? { behavior_delta_keys: behaviorDeltaKeys.join("|") } : {}),
    ...(dominantInterestKeys.length > 0 ? { dominant_interest_keys: dominantInterestKeys.join("|") } : {}),
    ...(resumeBiasKeys.length > 0 ? { resume_bias_keys: resumeBiasKeys.join("|") } : {}),
    ...(memoryRewriteKeys.length > 0 ? { memory_rewrite_keys: memoryRewriteKeys.join("|") } : {}),
    ...(memoryRewriteReason ? { memory_rewrite_reason: memoryRewriteReason } : {}),
  };
}

export function appendMbtiLongitudinalMemoryQuery(
  href: string,
  memory?: MbtiLongitudinalMemoryViewModel | MbtiLongitudinalMemoryQueryViewModel | null
): string {
  const normalizedHref = normalizeText(href);
  if (!normalizedHref) {
    return "";
  }

  const url = new URL(normalizedHref, "https://fap.local");
  const query = buildMbtiLongitudinalMemoryQuery(memory);

  for (const [key, value] of Object.entries(query)) {
    if (!value) {
      continue;
    }

    url.searchParams.set(key, value);
  }

  return url.origin === "https://fap.local"
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

export function buildMbtiLongitudinalMemoryTelemetryFields(
  memory?: MbtiLongitudinalMemoryViewModel | MbtiLongitudinalMemoryQueryViewModel | null
): Record<string, string> {
  const query = buildMbtiLongitudinalMemoryQuery(memory);

  return {
    memoryContractVersion: normalizeText(query.memory_contract_version),
    memoryFingerprint: normalizeText(query.memory_fingerprint),
    memoryScope: normalizeText(query.memory_scope),
    memoryState: normalizeText(query.memory_state),
    memoryProgressionState: normalizeText(query.memory_progression_state),
    sectionHistoryKeys: normalizeText(query.section_history_keys),
    behaviorDeltaKeys: normalizeText(query.behavior_delta_keys),
    dominantInterestKeys: normalizeText(query.dominant_interest_keys),
    resumeBiasKeys: normalizeText(query.resume_bias_keys),
    memoryRewriteKeys: normalizeText(query.memory_rewrite_keys),
    memoryRewriteReason: normalizeText(query.memory_rewrite_reason),
  };
}

export function parseMbtiLongitudinalMemoryQuery(
  source?: URLSearchParams | SearchParamsRecord | null
): MbtiLongitudinalMemoryQueryViewModel | null {
  if (!source) {
    return null;
  }

  const memoryContractVersion = readParam(source, "memory_contract_version");
  const memoryFingerprint = readParam(source, "memory_fingerprint");
  const memoryScope = readParam(source, "memory_scope");
  const memoryState = readParam(source, "memory_state");
  const progressionState = readParam(source, "memory_progression_state");
  const sectionHistoryKeys = splitParam(readParam(source, "section_history_keys"));
  const behaviorDeltaKeys = splitParam(readParam(source, "behavior_delta_keys"));
  const dominantInterestKeys = splitParam(readParam(source, "dominant_interest_keys"));
  const resumeBiasKeys = splitParam(readParam(source, "resume_bias_keys"));
  const memoryRewriteKeys = splitParam(readParam(source, "memory_rewrite_keys"));
  const memoryRewriteReason = readParam(source, "memory_rewrite_reason");

  if (
    !memoryContractVersion &&
    !memoryFingerprint &&
    !memoryScope &&
    !memoryState &&
    !progressionState &&
    sectionHistoryKeys.length === 0 &&
    behaviorDeltaKeys.length === 0 &&
    dominantInterestKeys.length === 0 &&
    resumeBiasKeys.length === 0 &&
    memoryRewriteKeys.length === 0 &&
    !memoryRewriteReason
  ) {
    return null;
  }

  return {
    memoryContractVersion,
    memoryFingerprint,
    memoryScope,
    memoryState,
    progressionState,
    sectionHistoryKeys,
    behaviorDeltaKeys,
    dominantInterestKeys,
    resumeBiasKeys,
    memoryRewriteKeys,
    memoryRewriteReason,
  };
}

export function resolveMbtiMemoryRewriteReasonLabel(reason: string, locale: Locale): string {
  switch (reason) {
    case "resume_career_focus":
      return locale === "zh"
        ? "这次结果页更偏向继续你之前反复回到的职业线索。"
        : "This revisit leans into the career thread you kept returning to.";
    case "resume_growth_actions":
      return locale === "zh"
        ? "这次结果页更偏向继续你之前已经开始的成长动作。"
        : "This revisit continues the growth actions you already started.";
    case "resume_relationship_practice":
      return locale === "zh"
        ? "这次结果页更偏向继续你之前反复关注的人际练习。"
        : "This revisit continues the relationship practice you kept returning to.";
    case "refine_type_clarity":
      return locale === "zh"
        ? "这次结果页优先延续你之前反复查看的类型解释与边界说明。"
        : "This revisit prioritizes the type-clarity thread you kept revisiting.";
    case "resume_previous_focus":
      return locale === "zh"
        ? "这次结果页会直接接住你上一次停下来的重点。"
        : "This revisit picks back up from the focus where you last paused.";
    default:
      return locale === "zh"
        ? "这次结果页已经开始根据你过去一段时间的真实行为做重写。"
        : "This result is already being rewritten from your recent behavior history.";
  }
}
