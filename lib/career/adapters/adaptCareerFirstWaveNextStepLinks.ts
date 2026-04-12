import type { CareerFirstWaveNextStepLinksResponseRaw } from "@/lib/career/api/types";
import type {
  CareerFirstWaveNextStepFamilyHubLinkAdapter,
  CareerFirstWaveNextStepJobDetailLinkAdapter,
  CareerFirstWaveNextStepLinkAdapter,
  CareerFirstWaveNextStepLinkReasonCode,
  CareerFirstWaveNextStepLinksSummaryAdapter,
} from "@/lib/career/adapters/types";

type AdaptCareerFirstWaveNextStepLinksInput = {
  payload: CareerFirstWaveNextStepLinksResponseRaw | null;
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

function normalizeReasonCode(value: unknown): CareerFirstWaveNextStepLinkReasonCode | null {
  const normalized = normalizeString(value);

  if (normalized === "family_hub_discoverable" || normalized === "same_family_sibling_discoverable") {
    return normalized;
  }

  return null;
}

function adaptFamilyHubLink(raw: Record<string, unknown>): CareerFirstWaveNextStepFamilyHubLinkAdapter | null {
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

function adaptJobDetailLink(raw: Record<string, unknown>): CareerFirstWaveNextStepJobDetailLinkAdapter | null {
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

function adaptLink(raw: Record<string, unknown>): CareerFirstWaveNextStepLinkAdapter | null {
  const routeKind = normalizeString(raw.route_kind);

  if (routeKind === "career_family_hub") {
    return adaptFamilyHubLink(raw);
  }

  if (routeKind === "career_job_detail") {
    return adaptJobDetailLink(raw);
  }

  return null;
}

export function adaptCareerFirstWaveNextStepLinks(
  input: AdaptCareerFirstWaveNextStepLinksInput
): CareerFirstWaveNextStepLinksSummaryAdapter | null {
  const raw = input.payload;
  if (!raw || !isRecord(raw)) {
    return null;
  }

  const nextStepLinks = Array.isArray(raw.next_step_links)
    ? raw.next_step_links
        .filter(isRecord)
        .map(adaptLink)
        .filter((item): item is CareerFirstWaveNextStepLinkAdapter => item !== null)
    : [];

  const familyHubLinks = nextStepLinks.filter(
    (link): link is CareerFirstWaveNextStepFamilyHubLinkAdapter => link.routeKind === "career_family_hub"
  );
  const jobDetailLinks = nextStepLinks.filter(
    (link): link is CareerFirstWaveNextStepJobDetailLinkAdapter => link.routeKind === "career_job_detail"
  );
  const counts = isRecord(raw.counts) ? raw.counts : {};
  const subjectIdentity = isRecord(raw.subject_identity) ? raw.subject_identity : {};

  return {
    authoritySource: "career_backend_first_wave_next_step_links.v0.5",
    summaryKind: normalizeString(raw.summary_kind) ?? "career_first_wave_next_step_links",
    summaryVersion: normalizeString(raw.summary_version) ?? "unknown",
    scope: normalizeString(raw.scope) ?? "unknown",
    subjectKind: normalizeString(raw.subject_kind) ?? "unknown",
    subjectIdentity: {
      occupationUuid: normalizeString(subjectIdentity.occupation_uuid),
      canonicalSlug: normalizeString(subjectIdentity.canonical_slug),
      canonicalTitleEn: normalizeString(subjectIdentity.canonical_title_en),
    },
    counts: {
      total: normalizeNumber(counts.total),
      jobDetail: normalizeNumber(counts.job_detail),
      familyHub: normalizeNumber(counts.family_hub),
    },
    nextStepLinks,
    familyHubLinks,
    jobDetailLinks,
  };
}
