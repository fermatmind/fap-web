import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";

export const MENTAL_HEALTH_SCREENING_TEST_SLUGS = [
  SCALE_CANONICAL_SLUG_MAP.SDS_20,
  SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,
] as const;

const MENTAL_HEALTH_SCREENING_SCALE_CODES = new Set(["SDS_20", "CLINICAL_COMBO_68"]);
const MENTAL_HEALTH_SCREENING_SLUGS = new Set<string>(MENTAL_HEALTH_SCREENING_TEST_SLUGS);

export const MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER: Record<Locale, string> = {
  en: "This screening is for educational self-reflection only. It is not a medical diagnosis, treatment, or a substitute for advice from a qualified clinician or mental-health professional. If you may be in immediate danger or crisis, contact local emergency services or a qualified professional.",
  zh: "本测试仅用于自我观察和教育性参考，不构成医疗诊断、治疗建议，也不能替代医生、心理咨询师、精神科医生或其他专业人士的判断。如你正处于紧急危险或危机状态，请立即联系当地紧急服务或专业机构。",
};

export function isMentalHealthScreeningTest({
  slug,
  scaleCode,
}: {
  slug: string | null | undefined;
  scaleCode?: string | null;
}): boolean {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  const normalizedScaleCode = String(scaleCode ?? "").trim().toUpperCase();

  return MENTAL_HEALTH_SCREENING_SLUGS.has(normalizedSlug) || MENTAL_HEALTH_SCREENING_SCALE_CODES.has(normalizedScaleCode);
}
