import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import {
  getCareerRecommendationRenderState,
  type CareerDataStatus,
  type CareerRecommendationRenderState,
} from "@/lib/career/protocolReadiness";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

type CmsCareerRecommendationListItemApi = {
  runtime_type_code?: string | null;
  canonical_type_code?: string | null;
  display_type?: string | null;
  variant_code?: string | null;
  public_route_slug?: string | null;
  type_name?: string | null;
  nickname?: string | null;
  hero_summary?: string | null;
};

type CmsCareerRecommendationListApiResponse = {
  items?: CmsCareerRecommendationListItemApi[];
};

type CmsCareerRecommendationSectionApi = {
  title?: string | null;
  paragraphs?: unknown;
  items?: unknown;
  intro?: string | null;
  groups?: unknown;
  outro?: string | null;
  bullets?: unknown;
};

type CmsCareerRecommendationMatchedJobApi = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  fit_bucket?: string | null;
  fit_personality_codes?: unknown;
  mbti_primary_codes?: unknown;
  mbti_secondary_codes?: unknown;
};

type CmsCareerRecommendationMatchedGuideApi = {
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  fit_personality_codes?: unknown;
};

type CmsCareerRecommendationSeoApi = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  alternates?: Record<string, string | null | undefined> | null;
};

type CmsCareerRecommendationDetailApiResponse = CmsCareerRecommendationListItemApi & {
  graph_type_code?: string | null;
  keywords?: unknown;
  career?: {
    summary?: CmsCareerRecommendationSectionApi | null;
    advantages?: CmsCareerRecommendationSectionApi | null;
    weaknesses?: CmsCareerRecommendationSectionApi | null;
    preferred_roles?: CmsCareerRecommendationSectionApi | null;
    upgrade_suggestions?: CmsCareerRecommendationSectionApi | null;
  } | null;
  matched_jobs?: CmsCareerRecommendationMatchedJobApi[];
  matched_guides?: CmsCareerRecommendationMatchedGuideApi[];
  seo?: CmsCareerRecommendationSeoApi | null;
  _meta?: {
    public_route_type?: string | null;
    route_mode?: string | null;
    authority_source?: string | null;
  } | null;
  seo_surface_v1?: SeoSurfaceRaw | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

export type CareerRecommendationListItem = {
  careerDataStatus: CareerDataStatus;
  runtimeTypeCode: string;
  canonicalTypeCode: string;
  displayType: string;
  variantCode: string | null;
  publicRouteSlug: string;
  typeName: string;
  nickname: string;
  heroSummary: string;
  href: string;
};

export type CareerRecommendationNarrativeSummary = {
  title: string | null;
  paragraphs: string[];
};

export type CareerRecommendationNarrativeBullet = {
  title: string | null;
  description: string | null;
};

export type CareerRecommendationNarrativeBulletGroup = {
  title: string | null;
  items: CareerRecommendationNarrativeBullet[];
};

export type CareerRecommendationPreferredRoleGroup = {
  groupTitle: string | null;
  description: string | null;
  examples: string[];
};

export type CareerRecommendationPreferredRoles = {
  title: string | null;
  intro: string | null;
  groups: CareerRecommendationPreferredRoleGroup[];
  outro: string | null;
};

export type CareerRecommendationUpgradeBullet = {
  label: string | null;
  content: string | null;
};

export type CareerRecommendationUpgradeSuggestions = {
  title: string | null;
  paragraphs: string[];
  bullets: CareerRecommendationUpgradeBullet[];
};

export type CareerRecommendationMatchedJob = {
  slug: string;
  title: string;
  summary: string;
  fitBucket: "primary" | "secondary" | null;
  fitPersonalityCodes: string[];
  mbtiPrimaryCodes: string[];
  mbtiSecondaryCodes: string[];
  href: string;
};

export type CareerRecommendationMatchedGuide = {
  slug: string;
  title: string;
  summary: string;
  fitPersonalityCodes: string[];
  href: string;
};

export type CareerRecommendationSeoViewModel = {
  meta: {
    title: string;
    description: string;
    canonical: string | null;
    alternates: {
      en: string | null;
      "zh-CN": string | null;
    };
    og: {
      title: string;
      description: string;
      image: string | null;
      type: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string | null;
    };
    robots: string;
  };
  surface: SeoSurfaceViewModel | null;
};

export type CareerRecommendationDetail = CareerRecommendationListItem & {
  renderState: CareerRecommendationRenderState;
  graphTypeCode: string;
  keywords: string[];
  career: {
    summary: CareerRecommendationNarrativeSummary;
    advantages: CareerRecommendationNarrativeBulletGroup;
    weaknesses: CareerRecommendationNarrativeBulletGroup;
    preferredRoles: CareerRecommendationPreferredRoles;
    upgradeSuggestions: CareerRecommendationUpgradeSuggestions;
  };
  matchedJobs: CareerRecommendationMatchedJob[];
  matchedGuides: CareerRecommendationMatchedGuide[];
  seo: CareerRecommendationSeoViewModel;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
  meta: {
    publicRouteType: string | null;
    routeMode: string | null;
    authoritySource: string | null;
  };
};

const DEFAULT_ORG_ID = "0";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    query.set(key, String(value));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNullableText(...values: unknown[]): string | null {
  const text = normalizeText(...values);
  return text || null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isCareerRecommendationListItemApi(value: unknown): value is CmsCareerRecommendationListItemApi {
  return asRecord(value) !== null;
}

function isCareerRecommendationMatchedJobApi(value: unknown): value is CmsCareerRecommendationMatchedJobApi {
  return asRecord(value) !== null;
}

function isCareerRecommendationMatchedGuideApi(value: unknown): value is CmsCareerRecommendationMatchedGuideApi {
  return asRecord(value) !== null;
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(value.map((item) => normalizeText(item).toUpperCase()).filter(Boolean));
}

function normalizeParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(
      value
        .map((item) => normalizeText(item))
        .filter(Boolean)
    );
  }

  const raw = normalizeText(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(/\n{2,}/)
    .map((part) => part.replace(/\r\n?/g, "\n").trim())
    .filter(Boolean);
}

function normalizeCareerRecommendationSlug(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function normalizeAbsoluteUrl(value: string | null | undefined, fallbackPath: string): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return fallbackPath ? canonicalUrl(fallbackPath) : null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return canonicalUrl(normalized);
  }

  return fallbackPath ? canonicalUrl(fallbackPath) : null;
}

function normalizeApiLocale(locale: Locale | string): "en" | "zh-CN" {
  return toApiLocale(locale);
}

function normalizeMatchedJob(
  raw: CmsCareerRecommendationMatchedJobApi,
  locale: Locale | string
): CareerRecommendationMatchedJob | null {
  const slug = normalizeCareerRecommendationSlug(raw.slug);
  const title = normalizeText(raw.title);
  if (!slug || !title) {
    return null;
  }

  const fitBucket = normalizeText(raw.fit_bucket).toLowerCase();

  return {
    slug,
    title,
    summary: normalizeText(raw.summary),
    fitBucket: fitBucket === "primary" || fitBucket === "secondary" ? fitBucket : null,
    fitPersonalityCodes: normalizeStringArray(raw.fit_personality_codes),
    mbtiPrimaryCodes: normalizeStringArray(raw.mbti_primary_codes),
    mbtiSecondaryCodes: normalizeStringArray(raw.mbti_secondary_codes),
    href: localizedPath(`/career/jobs/${slug}`, normalizeLocale(locale)),
  };
}

function normalizeMatchedGuide(
  raw: CmsCareerRecommendationMatchedGuideApi,
  locale: Locale | string
): CareerRecommendationMatchedGuide | null {
  const slug = normalizeCareerRecommendationSlug(raw.slug);
  const title = normalizeText(raw.title);
  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    summary: normalizeText(raw.summary),
    fitPersonalityCodes: normalizeStringArray(raw.fit_personality_codes),
    href: localizedPath(`/career/guides/${slug}`, normalizeLocale(locale)),
  };
}

function normalizeBulletGroup(raw: CmsCareerRecommendationSectionApi | null | undefined): CareerRecommendationNarrativeBulletGroup {
  return {
    title: normalizeNullableText(raw?.title),
    items: asArray<Record<string, unknown>>(raw?.items).map((item) => ({
      title: normalizeNullableText(item.title),
      description: normalizeNullableText(item.description, item.body),
    })),
  };
}

function normalizePreferredRoles(raw: CmsCareerRecommendationSectionApi | null | undefined): CareerRecommendationPreferredRoles {
  return {
    title: normalizeNullableText(raw?.title),
    intro: normalizeNullableText(raw?.intro),
    groups: asArray<Record<string, unknown>>(raw?.groups).map((group) => ({
      groupTitle: normalizeNullableText(group.group_title, group.title),
      description: normalizeNullableText(group.description),
      examples: uniqueStrings(asArray(group.examples).map((item) => normalizeText(item)).filter(Boolean)),
    })),
    outro: normalizeNullableText(raw?.outro),
  };
}

function normalizeUpgradeSuggestions(
  raw: CmsCareerRecommendationSectionApi | null | undefined
): CareerRecommendationUpgradeSuggestions {
  return {
    title: normalizeNullableText(raw?.title),
    paragraphs: normalizeParagraphs(raw?.paragraphs),
    bullets: asArray<Record<string, unknown>>(raw?.bullets).map((item) => ({
      label: normalizeNullableText(item.label, item.title),
      content: normalizeNullableText(item.content, item.body),
    })),
  };
}

function normalizeCareerRecommendationSeo(
  raw: CmsCareerRecommendationSeoApi | null | undefined,
  locale: Locale | string,
  slug: string,
  title: string,
  description: string
): CareerRecommendationSeoViewModel {
  const canonicalPath = buildCareerRecommendationFrontendUrl(locale, slug);

  return {
    meta: {
      title: normalizeText(raw?.title, title),
      description: normalizeText(raw?.description, description),
      canonical: normalizeAbsoluteUrl(raw?.canonical, canonicalPath),
      alternates: {
        en: normalizeAbsoluteUrl(raw?.alternates?.en, buildCareerRecommendationFrontendUrl("en", slug)),
        "zh-CN": normalizeAbsoluteUrl(raw?.alternates?.["zh-CN"], buildCareerRecommendationFrontendUrl("zh", slug)),
      },
      og: {
        title: normalizeText(raw?.title, title),
        description: normalizeText(raw?.description, description),
        image: null,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: normalizeText(raw?.title, title),
        description: normalizeText(raw?.description, description),
        image: null,
      },
      robots: "index,follow",
    },
    surface: null,
  };
}

export function buildCareerRecommendationFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(
    `/career/recommendations/mbti/${normalizeCareerRecommendationSlug(slug)}`,
    normalizeLocale(locale)
  );
}

export function normalizeCareerRecommendationListItem(
  raw: CmsCareerRecommendationListItemApi,
  locale: Locale | string
): CareerRecommendationListItem | null {
  const publicRouteSlug = normalizeCareerRecommendationSlug(raw.public_route_slug);
  const canonicalTypeCode = normalizeText(raw.canonical_type_code).toUpperCase();
  const displayType = normalizeText(raw.display_type, raw.runtime_type_code, canonicalTypeCode).toUpperCase();

  if (!publicRouteSlug || !canonicalTypeCode || !displayType) {
    return null;
  }

  return {
    careerDataStatus: "trust_limited",
    runtimeTypeCode: normalizeText(raw.runtime_type_code, displayType).toUpperCase(),
    canonicalTypeCode,
    displayType,
    variantCode: normalizeNullableText(raw.variant_code)?.toUpperCase() ?? null,
    publicRouteSlug,
    typeName: normalizeText(raw.type_name, displayType),
    nickname: normalizeText(raw.nickname),
    heroSummary: normalizeText(raw.hero_summary),
    href: buildCareerRecommendationFrontendUrl(locale, publicRouteSlug),
  };
}

export function normalizeCareerRecommendationDetail(
  raw: CmsCareerRecommendationDetailApiResponse | null,
  locale: Locale | string
): CareerRecommendationDetail | null {
  if (!raw) {
    return null;
  }

  const listItem = normalizeCareerRecommendationListItem(raw, locale);
  if (!listItem) {
    return null;
  }

  const summary = raw.career?.summary ?? null;
  const heroSummary = normalizeText(raw.hero_summary, raw.seo?.description);
  const landingSurface = normalizeLandingSurface(raw.landing_surface_v1 ?? null);
  const answerSurface = normalizeAnswerSurface(raw.answer_surface_v1 ?? null);
  const seoSurface = normalizeSeoSurface(raw.seo_surface_v1 ?? null);
  const renderState = getCareerRecommendationRenderState({
    answerSurface,
    landingSurface,
    seoSurface,
    matchedJobs: asArray(raw.matched_jobs).filter(isCareerRecommendationMatchedJobApi),
    authoritySource: normalizeNullableText(raw._meta?.authority_source),
  });

  return {
    ...listItem,
    careerDataStatus: renderState.careerDataStatus,
    renderState,
    graphTypeCode: normalizeText(raw.graph_type_code, listItem.canonicalTypeCode).toUpperCase(),
    keywords: uniqueStrings(asArray(raw.keywords).map((item) => normalizeText(item)).filter(Boolean)),
    career: {
      summary: {
        title: normalizeNullableText(summary?.title),
        paragraphs: normalizeParagraphs(summary?.paragraphs),
      },
      advantages: normalizeBulletGroup(raw.career?.advantages),
      weaknesses: normalizeBulletGroup(raw.career?.weaknesses),
      preferredRoles: normalizePreferredRoles(raw.career?.preferred_roles),
      upgradeSuggestions: normalizeUpgradeSuggestions(raw.career?.upgrade_suggestions),
    },
    matchedJobs: asArray(raw.matched_jobs)
      .filter(isCareerRecommendationMatchedJobApi)
      .map((item) => normalizeMatchedJob(item, locale))
      .filter((item): item is CareerRecommendationMatchedJob => item !== null),
    matchedGuides: asArray(raw.matched_guides)
      .filter(isCareerRecommendationMatchedGuideApi)
      .map((item) => normalizeMatchedGuide(item, locale))
      .filter((item): item is CareerRecommendationMatchedGuide => item !== null),
    seo: {
      ...normalizeCareerRecommendationSeo(raw.seo, locale, listItem.publicRouteSlug, listItem.typeName, heroSummary),
      surface: seoSurface,
    },
    landingSurface,
    answerSurface,
    meta: {
      publicRouteType: normalizeNullableText(raw._meta?.public_route_type),
      routeMode: normalizeNullableText(raw._meta?.route_mode),
      authoritySource: normalizeNullableText(raw._meta?.authority_source),
    },
  };
}

export async function listMbtiCareerRecommendations(locale: Locale | string): Promise<CareerRecommendationListItem[]> {
  const query = buildQuery({
    locale: normalizeApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerRecommendationListApiResponse>(
      `/v0.5/career-recommendations/mbti${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    return asArray(response.items)
      .filter(isCareerRecommendationListItemApi)
      .map((item) => normalizeCareerRecommendationListItem(item, locale))
      .filter((item): item is CareerRecommendationListItem => item !== null);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    return [];
  }
}

export async function getMbtiCareerRecommendationByType(
  locale: Locale | string,
  type: string
): Promise<CareerRecommendationDetail | null> {
  const normalizedType = normalizeText(type);
  if (!normalizedType) {
    return null;
  }

  const query = buildQuery({
    locale: normalizeApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerRecommendationDetailApiResponse>(
      `/v0.5/career-recommendations/mbti/${encodeURIComponent(normalizedType)}${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    return normalizeCareerRecommendationDetail(response, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}
