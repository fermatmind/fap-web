import type {
  CareerAliasResolutionCandidateResponseRaw,
  CareerAliasResolutionFamilyResponseRaw,
  CareerAliasResolutionOccupationResponseRaw,
  CareerAliasResolutionResponseRaw,
} from "@/lib/career/api/types";
import type {
  CareerAliasResolutionAdapter,
  CareerAliasResolutionAmbiguousCandidateAdapter,
  CareerAliasResolutionTargetAdapter,
} from "@/lib/career/adapters/types";
import { buildCareerFamilyFrontendUrl, buildCareerJobFrontendUrl } from "@/lib/career/urls";

type AdaptCareerAliasResolutionInput = {
  locale: "en" | "zh";
  payload: CareerAliasResolutionResponseRaw | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload<T extends { data?: unknown }>(payload: T | null): Record<string, unknown> | null {
  if (!payload) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return isRecord(payload) ? payload : null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function adaptOccupationTarget(
  locale: "en" | "zh",
  raw: CareerAliasResolutionOccupationResponseRaw | Record<string, unknown>
): CareerAliasResolutionTargetAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const titleEn = normalizeString(raw.canonical_title_en);
  const titleZh = normalizeString(raw.canonical_title_zh);

  return {
    canonicalSlug,
    title:
      locale === "zh"
        ? titleZh ?? titleEn ?? humanizeSlug(canonicalSlug)
        : titleEn ?? titleZh ?? humanizeSlug(canonicalSlug),
    href: buildCareerJobFrontendUrl(locale, canonicalSlug),
  };
}

function adaptFamilyTarget(
  locale: "en" | "zh",
  raw: CareerAliasResolutionFamilyResponseRaw | Record<string, unknown>
): CareerAliasResolutionTargetAdapter | null {
  const canonicalSlug = normalizeString(raw.canonical_slug);
  if (!canonicalSlug) {
    return null;
  }

  const titleEn = normalizeString(raw.title_en);
  const titleZh = normalizeString(raw.title_zh);

  return {
    canonicalSlug,
    title:
      locale === "zh"
        ? titleZh ?? titleEn ?? humanizeSlug(canonicalSlug)
        : titleEn ?? titleZh ?? humanizeSlug(canonicalSlug),
    href: buildCareerFamilyFrontendUrl(locale, canonicalSlug),
  };
}

function adaptCandidate(
  locale: "en" | "zh",
  raw: CareerAliasResolutionCandidateResponseRaw | Record<string, unknown>
): CareerAliasResolutionAmbiguousCandidateAdapter | null {
  const candidateKind = normalizeString(raw.candidate_kind);
  if (candidateKind === "occupation") {
    const target = adaptOccupationTarget(locale, raw);
    if (!target) {
      return null;
    }

    return {
      candidateKind: "occupation",
      canonicalSlug: target.canonicalSlug,
      title: target.title,
      href: target.href,
    };
  }

  if (candidateKind === "family") {
    const target = adaptFamilyTarget(locale, raw);
    if (!target) {
      return null;
    }

    return {
      candidateKind: "family",
      canonicalSlug: target.canonicalSlug,
      title: target.title,
      href: target.href,
    };
  }

  return null;
}

export function adaptCareerAliasResolution(
  input: AdaptCareerAliasResolutionInput
): CareerAliasResolutionAdapter | null {
  const raw = unwrapPayload(input.payload);
  if (!raw) {
    return null;
  }

  const query = isRecord(raw.query) ? raw.query : {};
  const resolution = isRecord(raw.resolution) ? raw.resolution : {};
  const resolvedKind = normalizeString(resolution.resolved_kind);

  if (!resolvedKind) {
    return null;
  }

  const base = {
    authoritySource: "career_backend_alias_resolution.v0.5",
    query: {
      raw: normalizeString(query.raw) ?? "",
      normalized: normalizeString(query.normalized) ?? "",
      locale: normalizeString(query.locale),
    },
  };

  if (resolvedKind === "occupation") {
    const occupation = adaptOccupationTarget(input.locale, isRecord(resolution.occupation) ? resolution.occupation : {});
    if (!occupation) {
      return null;
    }

    return {
      ...base,
      resolution: {
        resolvedKind: "occupation",
        occupation,
      },
    };
  }

  if (resolvedKind === "family") {
    const family = adaptFamilyTarget(input.locale, isRecord(resolution.family) ? resolution.family : {});
    if (!family) {
      return null;
    }

    return {
      ...base,
      resolution: {
        resolvedKind: "family",
        family,
      },
    };
  }

  if (resolvedKind === "ambiguous") {
    const candidates = Array.isArray(resolution.candidates)
      ? resolution.candidates.filter(isRecord).map((item) => adaptCandidate(input.locale, item)).filter(Boolean)
      : [];

    return {
      ...base,
      resolution: {
        resolvedKind: "ambiguous",
        candidates: candidates as CareerAliasResolutionAmbiguousCandidateAdapter[],
      },
    };
  }

  if (resolvedKind === "none") {
    return {
      ...base,
      resolution: {
        resolvedKind: "none",
      },
    };
  }

  return null;
}
