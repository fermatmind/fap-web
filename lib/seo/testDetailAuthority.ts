import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

export type TestDetailAuthoritySurface = "metadata" | "faq" | "cta";

export type TestDetailAuthorityDecision = {
  surface: TestDetailAuthoritySurface;
  source: "backend_authority" | "compatibility_wrapper" | "blocked";
  status: "complete" | "partial" | "dangerous_if_expanded" | "blocked";
  allowed: boolean;
  reason: string;
};

export type TestDetailAuthorityInput = {
  slug: string;
  hasSeoTitle: boolean;
  hasSeoDescription: boolean;
  hasOgImage: boolean;
  hasVisibleFaq: boolean;
  hasLandingSurface: boolean;
  hasStartTestTarget: boolean;
  hasCtaBundle: boolean;
};

export type TestDetailAuthorityResolution = {
  slug: string;
  compatibilityFallbackApproved: boolean;
  metadata: TestDetailAuthorityDecision;
  faq: TestDetailAuthorityDecision;
  cta: TestDetailAuthorityDecision;
  shouldNoindexMissingMetadataAuthority: boolean;
};

export const TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS = [
  SCALE_CANONICAL_SLUG_MAP.MBTI,
  SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
  SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
  SCALE_CANONICAL_SLUG_MAP.RIASEC,
  SCALE_CANONICAL_SLUG_MAP.EQ_60,
  SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
  SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,
  SCALE_CANONICAL_SLUG_MAP.SDS_20,
] as const;

const TEST_DETAIL_COMPATIBILITY_FALLBACK_SET = new Set<string>(TEST_DETAIL_COMPATIBILITY_FALLBACK_SLUGS);

function decision(
  surface: TestDetailAuthoritySurface,
  source: TestDetailAuthorityDecision["source"],
  allowed: boolean,
  reason: string
): TestDetailAuthorityDecision {
  return {
    surface,
    source,
    status: source === "backend_authority" ? "complete" : source === "compatibility_wrapper" ? "partial" : "blocked",
    allowed,
    reason,
  };
}

export function isTestDetailCompatibilityFallbackApproved(slug: string): boolean {
  return TEST_DETAIL_COMPATIBILITY_FALLBACK_SET.has(slug);
}

export function resolveTestDetailAuthority(input: TestDetailAuthorityInput): TestDetailAuthorityResolution {
  const compatibilityFallbackApproved = isTestDetailCompatibilityFallbackApproved(input.slug);
  const hasMetadataAuthority = input.hasSeoTitle && input.hasSeoDescription;
  const hasFaqAuthority = input.hasVisibleFaq;
  const hasCtaAuthority = input.hasLandingSurface && (input.hasStartTestTarget || input.hasCtaBundle);

  const metadata = hasMetadataAuthority
    ? decision("metadata", "backend_authority", true, "seo.surface.v1 or scale lookup supplied title and description")
    : compatibilityFallbackApproved
      ? decision("metadata", "compatibility_wrapper", true, "existing approved test detail compatibility only")
      : decision("metadata", "blocked", false, "new test detail metadata requires backend SEO authority");

  const faq = hasFaqAuthority
    ? decision("faq", "backend_authority", true, "visible FAQ came from content_i18n_json or answer surface authority")
    : compatibilityFallbackApproved
      ? decision("faq", "compatibility_wrapper", true, "existing approved test detail FAQ compatibility only")
      : decision("faq", "blocked", false, "new test detail FAQ requires visible backend/CMS FAQ authority");

  const cta = hasCtaAuthority
    ? decision("cta", "backend_authority", true, "landing_surface_v1 supplied CTA authority")
    : compatibilityFallbackApproved
      ? decision("cta", "compatibility_wrapper", true, "existing approved test detail CTA compatibility only")
      : decision("cta", "blocked", false, "new test detail CTA requires landing_surface_v1 or CMS authority");

  return {
    slug: input.slug,
    compatibilityFallbackApproved,
    metadata,
    faq,
    cta,
    shouldNoindexMissingMetadataAuthority: !hasMetadataAuthority && !compatibilityFallbackApproved,
  };
}
