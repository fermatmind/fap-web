import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

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

export function getEnneagramTechnicalNoteStatusLabel(status: string | null | undefined): string {
  const normalized = String(status ?? "").trim();
  if (ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS[normalized]) {
    return ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS[normalized];
  }

  return normalized || ENNEAGRAM_TECHNICAL_NOTE_STATUS_LABELS.unavailable;
}

export function getEnneagramTechnicalNoteNotClaimedLabel(key: string | null | undefined): string {
  const normalized = String(key ?? "").trim();
  return ENNEAGRAM_TECHNICAL_NOTE_NOT_CLAIMED_LABELS[normalized] ?? normalized;
}
