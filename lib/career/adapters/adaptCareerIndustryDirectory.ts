import type { CareerIndustryDirectoryResponseRaw } from "@/lib/career/api/fetchCareerIndustryDirectory";
import { normalizeCareerJobSlug } from "@/lib/career/slugSafety";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PublicReadError } from "@/lib/public-content/readError";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

export type CareerIndustryDirectoryJobAdapter = {
  slug: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  canonicalPath: string;
};

export type CareerIndustryDirectoryItemAdapter = {
  slug: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  count: number;
  publicDetailCount: number;
  indexableCount: number;
  canonicalPath: string;
  discoveryJobs: CareerIndustryDirectoryJobAdapter[];
};

export type CareerIndustryDirectoryAdapter = {
  authorityVersion: string | null;
  locale: "en" | "zh-CN";
  publicDetailIndexableCount: number;
  industryCount: number;
  industries: CareerIndustryDirectoryItemAdapter[];
};

type AdaptCareerIndustryDirectoryInput = {
  locale: Locale;
  payload: CareerIndustryDirectoryResponseRaw | null;
};

const FAMILY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function normalizeCount(value: unknown): number | null {
  const count = typeof value === "number" ? value : Number(value);
  return Number.isInteger(count) && count >= 0 ? count : null;
}

function contractError(cause: unknown): never {
  throw new PublicReadError({ kind: "contract", cause });
}

function canonicalPath(value: unknown, expected: string, cause: unknown): string {
  const path = normalizeInternalHref(value);
  if (path !== expected) {
    contractError(cause);
  }

  return path;
}

function adaptDiscoveryJob(
  raw: unknown,
  locale: Locale,
  seenSlugs: Set<string>
): CareerIndustryDirectoryJobAdapter {
  if (!isRecord(raw)) {
    return contractError(raw);
  }

  const slug = normalizeCareerJobSlug(raw.slug);
  const title = normalizeString(raw.title);
  if (!slug || !title || seenSlugs.has(slug)) {
    return contractError(raw);
  }
  seenSlugs.add(slug);

  return {
    slug,
    title,
    titleEn: normalizeString(raw.title_en),
    titleZh: normalizeString(raw.title_zh),
    canonicalPath: canonicalPath(raw.canonical_path, `/${locale}/career/jobs/${slug}`, raw),
  };
}

function adaptIndustry(
  raw: unknown,
  locale: Locale,
  seenSlugs: Set<string>
): CareerIndustryDirectoryItemAdapter {
  if (!isRecord(raw)) {
    return contractError(raw);
  }

  const slugValue = normalizeString(raw.slug)?.toLowerCase() ?? null;
  const slug = slugValue && FAMILY_SLUG_PATTERN.test(slugValue) ? slugValue : null;
  const title = normalizeString(raw.title);
  const count = normalizeCount(raw.count);
  const publicDetailCount = normalizeCount(raw.public_detail_count);
  const indexableCount = normalizeCount(raw.indexable_count);
  const discoveryJobs = Array.isArray(raw.discovery_jobs) ? raw.discovery_jobs : null;

  if (
    !slug ||
    !title ||
    count === null ||
    publicDetailCount === null ||
    indexableCount === null ||
    !discoveryJobs ||
    discoveryJobs.length > 3 ||
    seenSlugs.has(slug)
  ) {
    return contractError(raw);
  }
  seenSlugs.add(slug);

  const seenJobSlugs = new Set<string>();

  return {
    slug,
    title,
    titleEn: normalizeString(raw.title_en),
    titleZh: normalizeString(raw.title_zh),
    count,
    publicDetailCount,
    indexableCount,
    canonicalPath: canonicalPath(raw.canonical_path, `/${locale}/career/industries/${slug}`, raw),
    discoveryJobs: discoveryJobs.map((job) => adaptDiscoveryJob(job, locale, seenJobSlugs)),
  };
}

export function adaptCareerIndustryDirectory(
  input: AdaptCareerIndustryDirectoryInput
): CareerIndustryDirectoryAdapter {
  const apiLocale = toApiLocale(input.locale);
  if (input.payload === null) {
    return {
      authorityVersion: null,
      locale: apiLocale,
      publicDetailIndexableCount: 0,
      industryCount: 0,
      industries: [],
    };
  }

  const payload = input.payload;
  const authorityVersion = normalizeString(payload.authority_version);
  const publicDetailIndexableCount = normalizeCount(payload.public_detail_indexable_count);
  const industryCount = normalizeCount(payload.industry_count);
  const industries = Array.isArray(payload.industries) ? payload.industries : null;

  if (
    authorityVersion !== "career.industry_directory.v1" ||
    payload.bundle_kind !== "career_industry_directory" ||
    payload.bundle_version !== "career.industry_directory.v1" ||
    payload.locale !== apiLocale ||
    publicDetailIndexableCount === null ||
    industryCount === null ||
    !industries ||
    industryCount !== industries.length
  ) {
    return contractError(payload);
  }

  const seenIndustrySlugs = new Set<string>();

  return {
    authorityVersion,
    locale: apiLocale,
    publicDetailIndexableCount,
    industryCount,
    industries: industries.map((industry) => adaptIndustry(industry, input.locale, seenIndustrySlugs)),
  };
}
