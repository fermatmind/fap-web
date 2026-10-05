import { apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import type { CareerJobBundleResponseRaw, CareerJobSeoAuthorityResponseRaw } from "@/lib/career/api/types";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerJobBundleInput = {
  locale: Locale | string;
  slug: string;
  includeSeoAuthority?: boolean;
};

const DEFAULT_ORG_ID = "0";
const CAREER_JOB_DETAIL_FETCH_TIMEOUT_MS = 12_000;
export const CAREER_DETAIL_REVALIDATE_SECONDS = 300;
export const CAREER_DETAIL_PROJECTION_CACHE_VERSION = "career.detail.page.v1";

export function careerDetailCacheTag(locale: Locale | string, slug: string): string {
  return `career-detail:${toApiLocale(locale)}:${String(slug ?? "").trim().toLowerCase()}`;
}

function detailCacheOptions(locale: Locale | string, slug: string): {
  next: { revalidate: number; tags: string[] };
} {
  return {
    next: {
      revalidate: CAREER_DETAIL_REVALIDATE_SECONDS,
      tags: [careerDetailCacheTag(locale, slug)],
    },
  };
}

function bundleCacheOptions(locale: Locale | string, slug: string) {
  return toApiLocale(locale) === "zh-CN"
    ? {
        cache: "no-store" as const,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      }
    : { ...PUBLIC_API_CACHE_OPTIONS, ...detailCacheOptions(locale, slug) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  query.set("projection_contract", CAREER_DETAIL_PROJECTION_CACHE_VERSION);
  return `?${query.toString()}`;
}

function buildSeoAuthorityQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  query.set("org_id", DEFAULT_ORG_ID);
  return `?${query.toString()}`;
}

async function fetchCareerJobSeoAuthority(
  input: FetchCareerJobBundleInput & { normalizedSlug: string }
): Promise<CareerJobSeoAuthorityResponseRaw | null> {
  try {
    return await apiClient.getPublic<CareerJobSeoAuthorityResponseRaw>(
      `/v0.5/career-jobs/${encodeURIComponent(input.normalizedSlug)}/seo${buildSeoAuthorityQuery(input.locale)}`,
      {
        locale: input.locale,
        timeoutMs: CAREER_JOB_DETAIL_FETCH_TIMEOUT_MS,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
        ...detailCacheOptions(input.locale, input.normalizedSlug),
      }
    );
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}

function attachSeoAuthorityToBundle(
  bundle: CareerJobBundleResponseRaw,
  seoAuthority: CareerJobSeoAuthorityResponseRaw | null
): CareerJobBundleResponseRaw {
  if (!seoAuthority || !isRecord(bundle)) {
    return bundle;
  }

  if (isRecord(bundle.data)) {
    return {
      ...bundle,
      seo_authority_v1: seoAuthority,
      data: {
        ...bundle.data,
        seo_authority_v1: seoAuthority,
      },
    };
  }

  return {
    ...bundle,
    seo_authority_v1: seoAuthority,
  };
}

export async function fetchCareerJobBundle(
  input: FetchCareerJobBundleInput
): Promise<CareerJobBundleResponseRaw | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    const bundle = await apiClient.getPublic<CareerJobBundleResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}${buildQuery(input.locale)}`,
      {
        locale: input.locale,
        timeoutMs: CAREER_JOB_DETAIL_FETCH_TIMEOUT_MS,
        skipAuth: true,
        ...bundleCacheOptions(input.locale, normalizedSlug),
      }
    );
    const raw = isRecord(bundle.data) ? bundle.data : bundle;
    // Current Chinese metadata belongs to the same immutable page response.
    // Do not start an independent SEO read that can replay a different decision.
    if (input.includeSeoAuthority !== true ||
        (toApiLocale(input.locale) === "zh-CN" && (Object.hasOwn(raw, "career_page") || raw.bundle_version === CAREER_DETAIL_PROJECTION_CACHE_VERSION))) {
      return bundle;
    }
    return attachSeoAuthorityToBundle(bundle, await fetchCareerJobSeoAuthority({ ...input, normalizedSlug }));
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
