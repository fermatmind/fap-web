import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

const CANONICAL_AUTHORITY_ID = "FERMATMIND_ENNEAGRAM_PRIVATE_RESULT_CANONICAL";
const HASH_PATTERN = /^[0-9a-f]{64}$/;

export const ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS: Record<string, string> = {
  currently_operational: "当前已运行",
  collecting_data: "正在积累数据",
  pending_sample: "样本积累中",
  unavailable: "暂不可用",
  not_claimed: "不作此类声明",
};

export const ENNEAGRAM_TECHNICAL_NOTE_NOT_CLAIMED_LABELS: Record<string, string> = {
  clinical_validity: "临床效度",
  hiring_screening_suitability: "招聘筛选适用性",
  cross_form_numeric_equivalence: "跨题型数值等价性",
};

export function buildEnneagramTechnicalNoteHref(locale: Locale): string {
  return localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM}/technical-note`, locale);
}

export function resolveEnneagramTechnicalNoteHref(candidate: string | null | undefined, locale: Locale): string {
  const normalized = String(candidate ?? "").trim();
  if (!normalized.startsWith("/")) {
    return buildEnneagramTechnicalNoteHref(locale);
  }

  return normalized.startsWith(`/${locale}/`) ? normalized : localizedPath(normalized, locale);
}

export function getEnneagramTechnicalNoteStatusLabel(status: string | null | undefined, locale: Locale = "zh"): string {
  const normalized = String(status ?? "").trim();
  if (locale === "en") return ({ currently_operational: "Currently operational", collecting_data: "Collecting data", pending_sample: "Awaiting samples", partial: "Partially available", planned: "Planned", unavailable: "Unavailable", not_claimed: "Not claimed" } as Record<string, string>)[normalized] ?? (normalized || "Unavailable");
  if (ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS[normalized]) {
    return ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS[normalized];
  }

  return normalized || ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS.unavailable;
}

export function getEnneagramTechnicalNoteNotClaimedLabel(key: string | null | undefined, locale: Locale = "zh"): string {
  const normalized = String(key ?? "").trim();
  if (locale === "en") return ({ clinical_validity: "Clinical validity", hiring_screening_suitability: "Hiring or screening suitability", cross_form_numeric_equivalence: "Numerical equivalence across forms", ability: "Ability", personality: "Personality", values: "Values", career_success_probability: "Career success probability", job_fit: "Job fit", career_registry_match: "Occupation registry matching", cross_form_raw_score_delta: "Raw score changes across forms" } as Record<string, string>)[normalized] ?? normalized.replaceAll("_", " ");
  return ENNEAGRAM_TECHNICAL_NOTE_NOT_CLAIMED_LABELS[normalized] ?? normalized;
}

export function isCanonicalEnneagramTechnicalNote(value: unknown, locale: Locale): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const note = value as Record<string, unknown>;
  const canonicalLocale = locale === "zh" ? "zh-CN" : "en";

  return (
    note.schema_version === "enneagram.technical_note.v1" &&
    note.scale_code === "ENNEAGRAM" &&
    note.canonical_authority_id === CANONICAL_AUTHORITY_ID &&
    typeof note.canonical_release_id === "string" &&
    note.canonical_release_id.trim().length > 0 &&
    typeof note.canonical_source_hash === "string" &&
    HASH_PATTERN.test(note.canonical_source_hash.toLowerCase()) &&
    typeof note.canonical_compiled_hash === "string" &&
    HASH_PATTERN.test(note.canonical_compiled_hash.toLowerCase()) &&
    note.canonical_locale === canonicalLocale
  );
}
