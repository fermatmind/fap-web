import { normalizeTopicSlug } from "@/lib/cms/topics";

export type TopicLlmsCompatibilityFallback = {
  slug: string;
  title: string;
  allowedInLlms: boolean;
  allowedInLlmsFull: boolean;
  allowedTopicCtaFallback: boolean;
  reason: string;
};

export const TOPIC_LLMS_COMPATIBILITY_FALLBACKS: readonly TopicLlmsCompatibilityFallback[] = [
  {
    slug: "mbti",
    title: "MBTI",
    allowedInLlms: true,
    allowedInLlmsFull: true,
    allowedTopicCtaFallback: true,
    reason: "Existing public topic compatibility fixture until backend/CMS topic exposure authority is complete.",
  },
  {
    slug: "big-five",
    title: "Big Five",
    allowedInLlms: true,
    allowedInLlmsFull: true,
    allowedTopicCtaFallback: true,
    reason: "Existing public topic compatibility fixture until backend/CMS topic exposure authority is complete.",
  },
  {
    slug: "iq-eq",
    title: "IQ and EQ",
    allowedInLlms: true,
    allowedInLlmsFull: true,
    allowedTopicCtaFallback: true,
    reason: "Existing public topic compatibility fixture until backend/CMS topic exposure authority is complete.",
  },
] as const;

export const TOPIC_LLMS_COMPATIBILITY_FALLBACK_SLUGS = TOPIC_LLMS_COMPATIBILITY_FALLBACKS.map(
  (topic) => topic.slug
);

export function getTopicLlmsCompatibilityFallback(slug: string): TopicLlmsCompatibilityFallback | null {
  const normalizedSlug = normalizeTopicSlug(slug);

  return TOPIC_LLMS_COMPATIBILITY_FALLBACKS.find((topic) => topic.slug === normalizedSlug) ?? null;
}

export function resolveTopicRuntimeAuthority(input: {
  slug: string;
  hasLandingSurfaceCtaBundle: boolean;
}): {
  compatibilityFallbackApproved: boolean;
  cta: {
    allowed: boolean;
    source: "landing_surface_v1" | "compatibility_fixture" | "blocked";
  };
} {
  const fallback = getTopicLlmsCompatibilityFallback(input.slug);
  const compatibilityFallbackApproved = Boolean(fallback?.allowedTopicCtaFallback);

  if (input.hasLandingSurfaceCtaBundle) {
    return {
      compatibilityFallbackApproved,
      cta: {
        allowed: true,
        source: "landing_surface_v1",
      },
    };
  }

  if (compatibilityFallbackApproved) {
    return {
      compatibilityFallbackApproved,
      cta: {
        allowed: true,
        source: "compatibility_fixture",
      },
    };
  }

  return {
    compatibilityFallbackApproved,
    cta: {
      allowed: false,
      source: "blocked",
    },
  };
}
