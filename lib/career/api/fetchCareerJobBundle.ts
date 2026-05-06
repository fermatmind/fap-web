import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import type { CareerJobBundleResponseRaw, CareerJobSeoAuthorityResponseRaw } from "@/lib/career/api/types";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

type FetchCareerJobBundleInput = {
  locale: Locale | string;
  slug: string;
  includeSeoAuthority?: boolean;
};

const DEFAULT_ORG_ID = "0";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
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
    return await apiClient.get<CareerJobSeoAuthorityResponseRaw>(
      `/v0.5/career-jobs/${encodeURIComponent(input.normalizedSlug)}/seo${buildSeoAuthorityQuery(input.locale)}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
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
    const bundle = await apiClient.get<CareerJobBundleResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}${buildQuery(input.locale)}`,
      {
        locale: input.locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );
    if (input.includeSeoAuthority !== true) {
      return bundle;
    }

    const seoAuthority = await fetchCareerJobSeoAuthority({ ...input, normalizedSlug });
    return attachSeoAuthorityToBundle(bundle, seoAuthority);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
