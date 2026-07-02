import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { shouldFetchCareerSalaryAssetPreview } from "@/lib/career/salaryAssetPreviewConfig";

const CAREER_SALARY_ASSET_FETCH_TIMEOUT_MS = 12_000;

export type CareerSalaryAssetPreviewSource = {
  market: "CN" | "US" | "UK" | "EU" | string;
  name: string;
  url: string;
};

export type CareerSalaryAssetPreviewReference = {
  heading?: string;
  body?: string;
  display_monthly_range_cny?: string;
  data_boundary?: string;
  limitations?: string[];
};

export type CareerSalaryAssetPreviewItem = {
  factor?: string;
  description?: string;
};

export type CareerSalaryAssetPreviewAsset = {
  slug: string;
  locale: "zh-CN" | "en";
  heading: string;
  summary?: {
    headline?: string;
    short_answer?: string;
    confidence_label?: string;
  };
  china_recruitment_reference?: CareerSalaryAssetPreviewReference;
  china_official_context?: CareerSalaryAssetPreviewReference;
  us_official_reference?: CareerSalaryAssetPreviewReference & {
    source_ids?: string[];
  };
  uk_reference?: CareerSalaryAssetPreviewReference & {
    source_id?: string;
  };
  eu_context_boundary?: CareerSalaryAssetPreviewReference & {
    source_id?: string;
  };
  salary_drivers?: CareerSalaryAssetPreviewItem[];
  reader_guidance?: string[];
  sources?: CareerSalaryAssetPreviewSource[];
};

type CareerSalaryAssetPreviewResponseRaw = {
  ok?: unknown;
  preview?: unknown;
  status?: unknown;
  salary_asset_v1?: unknown;
};

type FetchCareerSalaryAssetPreviewInput = {
  locale: Locale | string;
  slug: string;
};

const PUBLIC_READABLE_ASSET_STATUS = "production_imported";
const MAX_VISIBLE_SALARY_SOURCES = 6;
const MIN_PUBLIC_SALARY_SOURCES = 2;
const INTERNAL_FIELD_NAMES = new Set([
  "audit_fields",
  "derived_from_evidence",
  "derived_from_synthesis",
  "evidence_count",
  "evidence_id",
  "evidence_ids",
  "evidence_used",
  "estimate_row_hash",
  "internal_lineage",
  "lineage",
  "raw_source_count",
  "row_hash",
  "search_projection",
  "source_count",
  "source_id",
  "source_ids",
  "visible_count",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isString);
}

function hasInternalField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasInternalField);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).some(([key, nested]) => INTERNAL_FIELD_NAMES.has(key) || hasInternalField(nested));
}

function isSafePublicSourceUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function adaptReference(value: unknown): CareerSalaryAssetPreviewReference | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    heading: isString(value.heading) ? value.heading : undefined,
    body: isString(value.body) ? value.body : undefined,
    display_monthly_range_cny: isString(value.display_monthly_range_cny) ? value.display_monthly_range_cny : undefined,
    data_boundary: isString(value.data_boundary) ? value.data_boundary : undefined,
    limitations: toStringArray(value.limitations),
  };
}

function adaptSources(value: unknown): CareerSalaryAssetPreviewSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item) || !isString(item.market) || !isString(item.name) || !isString(item.url) || !isSafePublicSourceUrl(item.url)) {
        return null;
      }

      return {
        market: item.market.trim(),
        name: item.name.trim().replace(/^\//, ""),
        url: item.url.trim(),
      };
    })
    .filter((item): item is CareerSalaryAssetPreviewSource => item !== null)
    .filter((item) => item.market.length > 0 && item.name.length > 0)
    .slice(0, MAX_VISIBLE_SALARY_SOURCES);
}

function adaptItems(value: unknown): CareerSalaryAssetPreviewItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const factor = isString(item.factor) ? item.factor : undefined;
      const description = isString(item.description) ? item.description : undefined;
      if (!factor && !description) {
        return null;
      }

      const adapted: CareerSalaryAssetPreviewItem = {};
      if (factor) {
        adapted.factor = factor;
      }
      if (description) {
        adapted.description = description;
      }

      return adapted;
    })
    .filter((item): item is CareerSalaryAssetPreviewItem => item !== null);
}

function adaptSalaryAsset(value: unknown, expectedSlug: string, expectedLocale: "zh-CN" | "en"): CareerSalaryAssetPreviewAsset | null {
  if (!isRecord(value) || value.slug !== expectedSlug || value.locale !== expectedLocale || !isString(value.heading) || hasInternalField(value)) {
    return null;
  }

  const sources = adaptSources(value.sources);
  if (sources.length < MIN_PUBLIC_SALARY_SOURCES) {
    return null;
  }

  const summary = isRecord(value.summary)
    ? {
        headline: isString(value.summary.headline) ? value.summary.headline : undefined,
        short_answer: isString(value.summary.short_answer) ? value.summary.short_answer : undefined,
        confidence_label: isString(value.summary.confidence_label) ? value.summary.confidence_label : undefined,
      }
    : undefined;

  return {
    slug: expectedSlug,
    locale: expectedLocale,
    heading: value.heading,
    summary,
    china_recruitment_reference: adaptReference(value.china_recruitment_reference),
    china_official_context: adaptReference(value.china_official_context),
    us_official_reference: adaptReference(value.us_official_reference),
    uk_reference: adaptReference(value.uk_reference),
    eu_context_boundary: adaptReference(value.eu_context_boundary),
    salary_drivers: adaptItems(value.salary_drivers),
    reader_guidance: toStringArray(value.reader_guidance),
    sources,
  };
}

function isAllowedSalaryAssetResponse(payload: CareerSalaryAssetPreviewResponseRaw | null | undefined): boolean {
  if (payload?.ok !== true) {
    return false;
  }

  const status = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
  return status === PUBLIC_READABLE_ASSET_STATUS && payload.preview !== true;
}

export async function fetchCareerSalaryAssetPreview(
  input: FetchCareerSalaryAssetPreviewInput
): Promise<CareerSalaryAssetPreviewAsset | null> {
  const normalizedSlug = String(input.slug ?? "").trim().toLowerCase();
  if (!normalizedSlug || !shouldFetchCareerSalaryAssetPreview(normalizedSlug)) {
    return null;
  }

  const apiLocale = toApiLocale(input.locale);
  const query = new URLSearchParams({ locale: apiLocale });

  try {
    const payload = await apiClient.get<CareerSalaryAssetPreviewResponseRaw>(
      `/v0.5/career/jobs/${encodeURIComponent(normalizedSlug)}/salary-asset?${query.toString()}`,
      {
        locale: input.locale,
        timeoutMs: CAREER_SALARY_ASSET_FETCH_TIMEOUT_MS,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    if (!isAllowedSalaryAssetResponse(payload)) {
      return null;
    }

    return adaptSalaryAsset(payload.salary_asset_v1, normalizedSlug, apiLocale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
