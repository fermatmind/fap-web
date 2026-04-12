import type { CareerFirstWaveRecommendationCompanionLinksResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter,
  CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter,
  CareerFirstWaveRecommendationCompanionLinkAdapter,
  CareerFirstWaveRecommendationCompanionLinkReasonCode,
  CareerFirstWaveRecommendationCompanionLinksSummaryAdapter,
  CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter,
  CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerFirstWaveRecommendationCompanionLinksInput = {
  payload: CareerFirstWaveRecommendationCompanionLinksResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeReasonCode(value: unknown): CareerFirstWaveRecommendationCompanionLinkReasonCode | null {
  const normalized = normalizeString(value);

  if (
    normalized === "target_job_detail_companion" ||
    normalized === "target_family_hub_companion" ||
    normalized === "matched_job_detail_companion" ||
    normalized === "recommendation_test_support" ||
    normalized === "recommendation_topic_support"
  ) {
    return normalized;
  }

  return null;
}

function adaptFamilyHubLink(
  raw: Record<string, unknown>
): CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const linkReasonCode = normalizeReasonCode(raw.link_reason_code);

  if (!canonicalPath || !canonicalSlug || !linkReasonCode) {
    return null;
  }

  return {
    routeKind: "career_family_hub",
    canonicalPath,
    canonicalSlug,
    linkReasonCode,
    familyUuid: normalizeString(raw.family_uuid),
    titleEn: normalizeString(raw.title_en),
  };
}

function adaptJobDetailLink(
  raw: Record<string, unknown>
): CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const linkReasonCode = normalizeReasonCode(raw.link_reason_code);

  if (!canonicalPath || !canonicalSlug || !linkReasonCode) {
    return null;
  }

  return {
    routeKind: "career_job_detail",
    canonicalPath,
    canonicalSlug,
    linkReasonCode,
    occupationUuid: normalizeString(raw.occupation_uuid),
    canonicalTitleEn: normalizeString(raw.canonical_title_en),
  };
}

function adaptTestLandingLink(
  raw: Record<string, unknown>
): CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const linkReasonCode = normalizeReasonCode(raw.link_reason_code);

  if (!canonicalPath || !canonicalSlug || linkReasonCode !== "recommendation_test_support") {
    return null;
  }

  return {
    routeKind: "test_landing",
    canonicalPath,
    canonicalSlug,
    linkReasonCode,
    scaleCode: normalizeString(raw.scale_code),
  };
}

function adaptTopicDetailLink(
  raw: Record<string, unknown>
): CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter | null {
  const canonicalPath = normalizeString(raw.canonical_path);
  const canonicalSlug = normalizeString(raw.canonical_slug);
  const linkReasonCode = normalizeReasonCode(raw.link_reason_code);

  if (!canonicalPath || !canonicalSlug || linkReasonCode !== "recommendation_topic_support") {
    return null;
  }

  return {
    routeKind: "topic_detail",
    canonicalPath,
    canonicalSlug,
    linkReasonCode,
    topicCode: normalizeString(raw.topic_code),
  };
}

function adaptLink(raw: Record<string, unknown>): CareerFirstWaveRecommendationCompanionLinkAdapter | null {
  const routeKind = normalizeString(raw.route_kind);

  if (routeKind === "career_family_hub") {
    return adaptFamilyHubLink(raw);
  }

  if (routeKind === "career_job_detail") {
    return adaptJobDetailLink(raw);
  }

  if (routeKind === "test_landing") {
    return adaptTestLandingLink(raw);
  }

  if (routeKind === "topic_detail") {
    return adaptTopicDetailLink(raw);
  }

  return null;
}

export function adaptCareerFirstWaveRecommendationCompanionLinks(
  input: AdaptCareerFirstWaveRecommendationCompanionLinksInput
): CareerFirstWaveRecommendationCompanionLinksSummaryAdapter | null {
  const raw = input.payload;
  if (!raw || !isRecord(raw)) {
    return null;
  }

  const companionLinks = Array.isArray(raw.companion_links)
    ? raw.companion_links
        .filter(isRecord)
        .map(adaptLink)
        .filter((item): item is CareerFirstWaveRecommendationCompanionLinkAdapter => item !== null)
    : [];

  const familyHubLinks = companionLinks.filter(
    (link): link is CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter =>
      link.routeKind === "career_family_hub"
  );
  const jobDetailLinks = companionLinks.filter(
    (link): link is CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter =>
      link.routeKind === "career_job_detail"
  );
  const testLandingLinks = companionLinks.filter(
    (link): link is CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter => link.routeKind === "test_landing"
  );
  const topicDetailLinks = companionLinks.filter(
    (link): link is CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter => link.routeKind === "topic_detail"
  );
  const counts = isRecord(raw.counts) ? raw.counts : {};
  const subjectIdentity = isRecord(raw.subject_identity) ? raw.subject_identity : {};

  return {
    authoritySource: "career_backend_first_wave_recommendation_companion_links.v0.5",
    summaryKind: normalizeString(raw.summary_kind) ?? "career_first_wave_recommendation_companion_links",
    summaryVersion: normalizeString(raw.summary_version) ?? "unknown",
    scope: normalizeString(raw.scope) ?? "unknown",
    subjectKind: normalizeString(raw.subject_kind) ?? "unknown",
    subjectIdentity: {
      typeCode: normalizeString(subjectIdentity.type_code),
      canonicalTypeCode: normalizeString(subjectIdentity.canonical_type_code),
      publicRouteSlug: normalizeString(subjectIdentity.public_route_slug),
      displayTitle: normalizeString(subjectIdentity.display_title),
    },
    counts: {
      total: normalizeNumber(counts.total),
      jobDetail: normalizeNumber(counts.job_detail),
      familyHub: normalizeNumber(counts.family_hub),
      testLanding: normalizeNumber(counts.test_landing),
      topicDetail: normalizeNumber(counts.topic_detail),
    },
    companionLinks,
    familyHubLinks,
    jobDetailLinks,
    testLandingLinks,
    topicDetailLinks,
  };
}
