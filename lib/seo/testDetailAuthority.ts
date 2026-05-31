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

export type IqLaunchSeoGuardInput = {
  slug: string;
  scaleCode?: string | null;
  hasSeoTitle: boolean;
  hasSeoDescription: boolean;
  title?: string | null;
  description?: string | null;
  featureList?: string[];
};

export type IqLaunchSeoGuardResolution = {
  applies: boolean;
  canonicalSlug: string;
  canonicalPath: string;
  hasBackendSeoAuthority: boolean;
  shouldNoindex: boolean;
  blocksSoftwareApplicationSchema: boolean;
  blocksSitemapLlmsExpansion: boolean;
  unsafeClaimBlocked: boolean;
  reason: string;
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

export const IQ_LAUNCH_CANONICAL_SLUG = SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN;

export const IQ_LAUNCH_FORBIDDEN_CLAIM_PHRASES = [
  "official iq score",
  "certified iq",
  "diagnose intelligence",
  "diagnostic iq",
  "percentile ranking",
  "population percentile",
  "智商分数",
  "官方智商",
  "认证智商",
  "智商排名",
  "人群百分位",
] as const;

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

export function isIqLaunchSlug(input: { slug: string; scaleCode?: string | null }): boolean {
  const scaleCode = String(input.scaleCode ?? "").trim().toUpperCase();

  return input.slug === IQ_LAUNCH_CANONICAL_SLUG
    || scaleCode === "IQ_RAVEN"
    || scaleCode === "IQ_INTELLIGENCE_QUOTIENT";
}

export function hasUnsafeIqLaunchClaim(value: string): boolean {
  const normalized = value.toLowerCase();

  return IQ_LAUNCH_FORBIDDEN_CLAIM_PHRASES.some((phrase) => normalized.includes(phrase.toLowerCase()));
}

export function resolveIqLaunchSeoGuard(input: IqLaunchSeoGuardInput): IqLaunchSeoGuardResolution {
  const applies = isIqLaunchSlug(input);
  const hasBackendSeoAuthority = input.hasSeoTitle && input.hasSeoDescription;
  const claimText = [input.title, input.description, ...(input.featureList ?? [])].filter(Boolean).join(" ");
  const unsafeClaimBlocked = applies && hasUnsafeIqLaunchClaim(claimText);
  const shouldNoindex = applies && (!hasBackendSeoAuthority || unsafeClaimBlocked);

  return {
    applies,
    canonicalSlug: IQ_LAUNCH_CANONICAL_SLUG,
    canonicalPath: `/tests/${IQ_LAUNCH_CANONICAL_SLUG}`,
    hasBackendSeoAuthority,
    shouldNoindex,
    blocksSoftwareApplicationSchema: applies,
    blocksSitemapLlmsExpansion: applies,
    unsafeClaimBlocked,
    reason: applies
      ? "IQ launch SEO requires backend SEO authority, no unsafe IQ claims, no SoftwareApplication schema, and no sitemap/llms expansion in this PR"
      : "not an IQ launch surface",
  };
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
