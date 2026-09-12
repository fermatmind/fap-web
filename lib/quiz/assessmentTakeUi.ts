import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getAssessmentLandingUi } from "@/lib/tests/assessmentLandingUi";

export const FOCUSED_ASSESSMENT_SLUGS: readonly string[] = [
  SCALE_CANONICAL_SLUG_MAP.MBTI,
  SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
  SCALE_CANONICAL_SLUG_MAP.RIASEC,
  SCALE_CANONICAL_SLUG_MAP.EQ_60,
];

export function getAssessmentTakeUi(slug: string, locale: "zh" | "en") {
  return FOCUSED_ASSESSMENT_SLUGS.includes(slug) ? getAssessmentLandingUi(slug, locale) : null;
}
