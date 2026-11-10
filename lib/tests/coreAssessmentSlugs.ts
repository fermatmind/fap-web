import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

const coreAssessmentSlugs = new Set<string>([
  SCALE_CANONICAL_SLUG_MAP.MBTI,
  SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
  SCALE_CANONICAL_SLUG_MAP.RIASEC,
  SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  SCALE_CANONICAL_SLUG_MAP.EQ_60,
]);

export function isCoreAssessmentSlug(slug: string): boolean {
  return coreAssessmentSlugs.has(resolveCanonicalSlug(slug));
}
