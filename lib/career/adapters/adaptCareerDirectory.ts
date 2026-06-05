import type { CareerDirectoryResponseRaw } from "@/lib/career/api/types";
import type { CareerDatasetMemberAdapter } from "@/lib/career/adapters/types";
import {
  formatCareerFamilyTitle,
  normalizeFamilySlug,
} from "@/lib/career/datasetDirectory";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
import { CAREER_STATIC_OCCUPATION_MEMBERS } from "@/lib/career/staticOccupationMembers";
import { type Locale } from "@/lib/i18n/locales";

export type CareerDirectoryFamilyFacetAdapter = {
  slug: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  count: number;
};

export type CareerDirectoryAdapter = {
  authorityVersion: string | null;
  publicTruth: {
    publicDetailIndexableCount: number;
    directoryMemberCount: number;
    futureScaleReady: boolean;
    excludedSlugs: string[];
  };
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    locale: string | null;
    family: string | null;
    query: string | null;
  };
  facets: {
    families: CareerDirectoryFamilyFacetAdapter[];
  };
  members: CareerDatasetMemberAdapter[];
};

type AdaptCareerDirectoryInput = {
  locale: Locale;
  payload: CareerDirectoryResponseRaw | null;
};

const STATIC_OCCUPATION_TITLE_BY_SLUG = new Map(
  CAREER_STATIC_OCCUPATION_MEMBERS.map((member) => [member.canonicalSlug, member.canonicalTitleZh])
);

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

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function adaptFamilyFacet(raw: unknown, locale: Locale): CareerDirectoryFamilyFacetAdapter | null {
  if (!isRecord(raw)) {
    return null;
  }

  const slug = normalizeString(raw.slug);
  if (!slug) {
    return null;
  }

  const titleEn = normalizeString(raw.title_en);
  const titleZh = normalizeString(raw.title_zh);
  const normalizedSlug = normalizeFamilySlug(slug);

  return {
    slug: normalizedSlug,
    title: locale === "zh" ? titleZh ?? formatCareerFamilyTitle(normalizedSlug, locale) : titleEn ?? titleZh ?? formatCareerFamilyTitle(normalizedSlug, locale),
    titleEn,
    titleZh,
    count: normalizeNumber(raw.count),
  };
}

function coalesceFamilyFacets(facets: CareerDirectoryFamilyFacetAdapter[]): CareerDirectoryFamilyFacetAdapter[] {
  const bySlug = new Map<string, CareerDirectoryFamilyFacetAdapter>();

  for (const facet of facets) {
    const existing = bySlug.get(facet.slug);

    if (!existing) {
      bySlug.set(facet.slug, facet);
      continue;
    }

    bySlug.set(facet.slug, {
      ...existing,
      title: existing.title || facet.title,
      titleEn: existing.titleEn ?? facet.titleEn,
      titleZh: existing.titleZh ?? facet.titleZh,
      count: existing.count + facet.count,
    });
  }

  return Array.from(bySlug.values());
}

function adaptMember(raw: unknown): CareerDatasetMemberAdapter | null {
  if (!isRecord(raw)) {
    return null;
  }

  const slug = normalizeCareerJobSlug(normalizeString(raw.slug));
  if (!slug) {
    return null;
  }

  const family = isRecord(raw.family) ? raw.family : {};
  const titleZh = normalizeString(raw.title_zh) ?? STATIC_OCCUPATION_TITLE_BY_SLUG.get(slug) ?? null;

  return {
    memberKind: "career_directory_authority",
    canonicalSlug: slug,
    canonicalTitleEn: normalizeString(raw.title_en) ?? normalizeString(raw.title) ?? humanizeSlug(slug),
    canonicalTitleZh: titleZh,
    familySlug: normalizeString(family.slug),
    publishTrack: "career_directory_authority",
    batchOrigin: "career_directory_authority.v1",
    releaseCohort: "public_detail_indexable",
    publicIndexState: normalizeBoolean(raw.indexable) ? "indexable" : "noindex",
    strongIndexDecision: normalizeBoolean(raw.detail_ready) ? "strong_index_ready" : "not_eligible",
    includedInPublicDataset: normalizeBoolean(raw.indexable) && normalizeBoolean(raw.detail_ready),
    exclusionReasons: [],
  };
}

export function adaptCareerDirectory(input: AdaptCareerDirectoryInput): CareerDirectoryAdapter {
  const payload = input.payload ?? {};
  const publicTruth = isRecord(payload.public_truth) ? payload.public_truth : {};
  const pagination = isRecord(payload.pagination) ? payload.pagination : {};
  const filters = isRecord(payload.filters) ? payload.filters : {};
  const facets = isRecord(payload.facets) ? payload.facets : {};
  const familyFacets = Array.isArray(facets.families) ? facets.families : [];
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  return {
    authorityVersion: normalizeString(payload.authority_version),
    publicTruth: {
      publicDetailIndexableCount: normalizeNumber(publicTruth.public_detail_indexable_count),
      directoryMemberCount: normalizeNumber(publicTruth.directory_member_count),
      futureScaleReady: normalizeBoolean(publicTruth.future_scale_ready),
      excludedSlugs: normalizeStringArray(publicTruth.excluded_slugs),
    },
    pagination: {
      page: Math.max(1, normalizeNumber(pagination.page) || 1),
      perPage: Math.max(1, normalizeNumber(pagination.per_page) || 50),
      total: Math.max(0, normalizeNumber(pagination.total)),
      totalPages: Math.max(0, normalizeNumber(pagination.total_pages)),
      hasNextPage: normalizeBoolean(pagination.has_next_page),
      hasPreviousPage: normalizeBoolean(pagination.has_previous_page),
    },
    filters: {
      locale: normalizeString(filters.locale),
      family: normalizeString(filters.family),
      query: normalizeString(filters.q),
    },
    facets: {
      families: coalesceFamilyFacets(
        familyFacets
          .map((facet) => adaptFamilyFacet(facet, input.locale))
          .filter((facet): facet is CareerDirectoryFamilyFacetAdapter => facet !== null)
      ),
    },
    members: rawItems.map(adaptMember).filter((member): member is CareerDatasetMemberAdapter => member !== null),
  };
}
