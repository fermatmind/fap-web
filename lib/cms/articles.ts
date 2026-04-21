import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { withLastKnownGood, type LastKnownGoodResult } from "@/lib/cms/last-known-good";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

const DEFAULT_ORG_ID = "0";
const DEFAULT_LIST_PER_PAGE = 20;
const DEFAULT_ENUMERATION_PER_PAGE = 100;

type CmsArticleApiTag = {
  id?: number;
  slug?: string;
  name?: string;
};

type CmsArticleApiCategory = {
  id?: number;
  slug?: string;
  name?: string;
} | null;

type CmsArticleApiRecord = {
  id?: number;
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string | null;
  content_md?: string | null;
  content_html?: string | null;
  author_name?: string | null;
  reviewer_name?: string | null;
  reading_minutes?: number | string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  cover_image_width?: number | string | null;
  cover_image_height?: number | string | null;
  cover_image_variants?: unknown;
  cover_image?: unknown;
  related_test_slug?: string | null;
  voice?: string | null;
  voice_order?: number | string | null;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  category?: CmsArticleApiCategory;
  tags?: CmsArticleApiTag[];
  seo_meta?: unknown;
};

type CmsArticlesApiResponse = {
  ok?: boolean;
  items?: CmsArticleApiRecord[];
  landing_surface_v1?: LandingSurfaceRaw | null;
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsArticleApiResponse = {
  ok?: boolean;
  article?: CmsArticleApiRecord | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

type CmsArticleSeoApiResponse = {
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
    alternates?: Record<string, string | null | undefined>;
    og?: {
      title?: string;
      description?: string;
      image?: string | null;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      image?: string | null;
    };
    robots?: string;
  };
  jsonld?: unknown;
  seo_surface_v1?: SeoSurfaceRaw | null;
};

export type CmsArticleTag = {
  id: number | null;
  slug: string;
  name: string;
};

export type CmsArticleCategory = {
  id: number | null;
  slug: string;
  name: string;
} | null;

export type CmsArticleImageVariant = {
  url: string;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  media: string | null;
};

export type CmsArticleImageVariants = {
  hero: CmsArticleImageVariant | null;
  card: CmsArticleImageVariant | null;
  thumbnail: CmsArticleImageVariant | null;
  square: CmsArticleImageVariant | null;
  og: CmsArticleImageVariant | null;
  preload: CmsArticleImageVariant | null;
};

export type CmsArticle = {
  id: number | null;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  contentMd: string;
  contentHtml: string;
  authorName: string | null;
  reviewerName: string | null;
  readingMinutes: number | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  coverImageVariants: CmsArticleImageVariants;
  relatedTestSlug: string | null;
  voice: string | null;
  voiceOrder: number | null;
  status: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  category: CmsArticleCategory;
  tags: CmsArticleTag[];
  seoMeta: unknown;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

export type CmsArticleSeoPayload = {
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
  jsonld: unknown;
  surface: SeoSurfaceViewModel | null;
};

export type CmsArticleLlmsEntry = {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  href: string;
  isIndexable: boolean;
  updatedAt: string | null;
};

export type CmsArticlesPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type GetCmsArticlesParams = {
  locale: Locale | string;
  page?: number;
  perPage?: number;
  relatedTestSlug?: string;
  voice?: string;
  allowLocalFallback?: boolean;
};

export type GetCmsArticlesResult = {
  items: CmsArticle[];
  pagination: CmsArticlesPagination;
  landingSurface: LandingSurfaceViewModel | null;
};

export type ListCmsArticlesForLlmsParams = {
  locale: Locale | string;
  perPage?: number;
};

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

function fallbackText(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    const normalized = String(candidate ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeIsoValue(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readRecordValue(record: unknown, ...keys: string[]): unknown {
  if (!record || typeof record !== "object") {
    return null;
  }

  const source = record as Record<string, unknown>;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return null;
}

function normalizeNamedEntity(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return normalizeIsoValue(value);
  }

  return (
    normalizeIsoValue(readRecordValue(value, "name", "title", "display_name", "displayName", "full_name", "fullName")) ??
    null
  );
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function buildFallbackExcerpt(article: CmsArticleApiRecord): string {
  const sources = [article.excerpt, article.content_html ? stripHtml(article.content_html) : null, article.content_md];

  for (const source of sources) {
    const normalized = String(source ?? "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return truncate(normalized, 220);
    }
  }

  return "";
}

function estimateReadingMinutes(...sources: Array<string | null | undefined>): number | null {
  const text = fallbackText(...sources.map((source) => (source ? stripHtml(source) : "")));
  if (!text) {
    return null;
  }

  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWordCount = text
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const weightedWords = latinWordCount + cjkCount / 1.8;

  return Math.max(1, Math.round(weightedWords / 220));
}

function normalizeImageVariant(value: unknown): CmsArticleImageVariant | null {
  if (typeof value === "string") {
    const url = normalizeIsoValue(value);
    return url ? { url, width: null, height: null, mimeType: null, media: null } : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const url = normalizeIsoValue(readRecordValue(value, "url", "src", "href"));
  if (!url) {
    return null;
  }

  return {
    url,
    width: normalizePositiveInteger(readRecordValue(value, "width", "w")),
    height: normalizePositiveInteger(readRecordValue(value, "height", "h")),
    mimeType: normalizeIsoValue(readRecordValue(value, "mime_type", "mimeType", "type")),
    media: normalizeIsoValue(readRecordValue(value, "media", "media_query", "mediaQuery")),
  };
}

function pickImageVariant(source: unknown, ...keys: string[]): CmsArticleImageVariant | null {
  for (const key of keys) {
    const value = readRecordValue(source, key);
    const variant = normalizeImageVariant(value);
    if (variant) {
      return variant;
    }
  }

  return null;
}

function normalizeImageVariants(source: unknown): CmsArticleImageVariants {
  return {
    hero: pickImageVariant(source, "hero", "full", "full_width", "fullWidth", "large", "desktop"),
    card: pickImageVariant(source, "card", "teaser", "large", "desktop", "list"),
    thumbnail: pickImageVariant(source, "thumbnail", "thumb", "medium", "mobile"),
    square: pickImageVariant(source, "square", "og_square", "one_by_one", "oneByOne"),
    og: pickImageVariant(source, "og", "social", "share", "open_graph", "openGraph"),
    preload: pickImageVariant(source, "preload", "placeholder", "blur", "low"),
  };
}

function firstImageUrl(...variants: Array<CmsArticleImageVariant | null>): string | null {
  for (const variant of variants) {
    if (variant?.url) {
      return variant.url;
    }
  }

  return null;
}

function replaceCanonicalValue(
  value: string,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string,
  slug: string
): string {
  const localizedCanonical = canonicalUrl(localizedCanonicalPath);
  const normalizedSlug = normalizeArticleSlug(slug);
  const fallbackSourceCanonical = canonicalUrl(`/articles/${normalizedSlug}`);
  const relativeCanonical = `/articles/${normalizedSlug}`;
  const candidates: Array<[string, string]> = [
    [String(sourceCanonical ?? "").trim(), localizedCanonical],
    [fallbackSourceCanonical, localizedCanonical],
    [relativeCanonical, localizedCanonicalPath],
  ];

  for (const [from, to] of candidates) {
    if (!from) {
      continue;
    }

    if (value === from) {
      return to;
    }

    if (value.startsWith(`${from}#`)) {
      return `${to}${value.slice(from.length)}`;
    }
  }

  return value;
}

function normalizeArticleJsonLd(
  jsonld: unknown,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string,
  slug: string
): unknown {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, walk(nested)]));
    }

    if (typeof value === "string") {
      return replaceCanonicalValue(value, sourceCanonical, localizedCanonicalPath, slug);
    }

    return value;
  };

  return jsonld ? walk(jsonld) : null;
}

export function normalizeArticleSlug(value: string): string {
  return String(value ?? "").trim();
}

export function buildArticleFrontendUrl(locale: Locale | string, slug: string): string {
  return localizedPath(`/articles/${normalizeArticleSlug(slug)}`, normalizeLocale(locale));
}

export function normalizeArticleSeoPayload(
  seo: CmsArticleSeoApiResponse | null,
  locale: Locale | string,
  slug: string
): CmsArticleSeoPayload | null {
  if (!seo) {
    return null;
  }

  const normalizedSlug = normalizeArticleSlug(slug);
  const canonicalPath = buildArticleFrontendUrl(locale, normalizedSlug);

  return {
    meta: {
      title: fallbackText(seo.meta?.title),
      description: fallbackText(seo.meta?.description),
      canonical: canonicalUrl(canonicalPath),
      alternates: {
        en: canonicalUrl(buildArticleFrontendUrl("en", normalizedSlug)),
        "zh-CN": canonicalUrl(buildArticleFrontendUrl("zh", normalizedSlug)),
      },
      og: {
        title: fallbackText(seo.meta?.og?.title, seo.meta?.title),
        description: fallbackText(seo.meta?.og?.description, seo.meta?.description),
        image: normalizeIsoValue(seo.meta?.og?.image),
        type: fallbackText(seo.meta?.og?.type, "article"),
      },
      twitter: {
        card: fallbackText(seo.meta?.twitter?.card, "summary_large_image"),
        title: fallbackText(seo.meta?.twitter?.title, seo.meta?.title),
        description: fallbackText(seo.meta?.twitter?.description, seo.meta?.description),
        image: normalizeIsoValue(seo.meta?.twitter?.image ?? seo.meta?.og?.image),
      },
      robots: fallbackText(seo.meta?.robots, "index,follow"),
    },
    jsonld: normalizeArticleJsonLd(seo.jsonld ?? null, seo.meta?.canonical, canonicalPath, normalizedSlug),
    surface: normalizeSeoSurface(seo.seo_surface_v1 ?? null),
  };
}

function normalizeTag(tag: CmsArticleApiTag): CmsArticleTag | null {
  const name = String(tag.name ?? "").trim();
  const slug = String(tag.slug ?? "").trim();

  if (!name && !slug) {
    return null;
  }

  return {
    id: typeof tag.id === "number" ? tag.id : null,
    slug,
    name: name || slug,
  };
}

function normalizeCategory(category: CmsArticleApiCategory): CmsArticleCategory {
  if (!category || typeof category !== "object") {
    return null;
  }

  const name = String(category.name ?? "").trim();
  const slug = String(category.slug ?? "").trim();

  if (!name && !slug) {
    return null;
  }

  return {
    id: typeof category.id === "number" ? category.id : null,
    slug,
    name: name || slug,
  };
}

function normalizeArticle(article: CmsArticleApiRecord): CmsArticle {
  const nestedCoverImage = article.cover_image;
  const coverImageVariants = normalizeImageVariants(
    article.cover_image_variants ?? readRecordValue(nestedCoverImage, "variants", "image_variants", "imageVariants")
  );
  const coverImageUrl =
    normalizeIsoValue(article.cover_image_url) ??
    normalizeIsoValue(readRecordValue(nestedCoverImage, "url", "src")) ??
    firstImageUrl(coverImageVariants.hero, coverImageVariants.card, coverImageVariants.og, coverImageVariants.thumbnail);
  const readingMinutes =
    normalizePositiveInteger(article.reading_minutes) ?? estimateReadingMinutes(article.content_html, article.content_md, article.excerpt);

  return {
    id: typeof article.id === "number" ? article.id : null,
    slug: normalizeArticleSlug(String(article.slug ?? "")),
    locale: String(article.locale ?? "").trim() || "en",
    title: String(article.title ?? "").trim(),
    excerpt: buildFallbackExcerpt(article),
    contentMd: String(article.content_md ?? ""),
    contentHtml: String(article.content_html ?? ""),
    authorName: normalizeIsoValue(article.author_name) ?? normalizeNamedEntity(readRecordValue(article, "author", "byline")),
    reviewerName: normalizeIsoValue(article.reviewer_name) ?? normalizeNamedEntity(readRecordValue(article, "reviewer", "reviewed_by")),
    readingMinutes,
    coverImageUrl,
    coverImageAlt:
      normalizeIsoValue(article.cover_image_alt) ??
      normalizeIsoValue(readRecordValue(nestedCoverImage, "alt", "alt_text", "altText")) ??
      null,
    coverImageWidth:
      normalizePositiveInteger(article.cover_image_width) ?? normalizePositiveInteger(readRecordValue(nestedCoverImage, "width")),
    coverImageHeight:
      normalizePositiveInteger(article.cover_image_height) ?? normalizePositiveInteger(readRecordValue(nestedCoverImage, "height")),
    coverImageVariants,
    relatedTestSlug: normalizeIsoValue(article.related_test_slug),
    voice: normalizeIsoValue(article.voice),
    voiceOrder: normalizePositiveInteger(article.voice_order),
    status: String(article.status ?? "").trim(),
    isPublic: Boolean(article.is_public),
    isIndexable: Boolean(article.is_indexable),
    publishedAt: article.published_at ?? null,
    scheduledAt: article.scheduled_at ?? null,
    createdAt: article.created_at ?? null,
    updatedAt: article.updated_at ?? null,
    category: normalizeCategory(article.category ?? null),
    tags: Array.isArray(article.tags)
      ? article.tags.map(normalizeTag).filter((tag): tag is CmsArticleTag => tag !== null)
      : [],
    seoMeta: article.seo_meta ?? null,
    landingSurface: null,
    answerSurface: null,
  };
}

function matchesRequestedLocale(articleLocale: string, locale: Locale | string): boolean {
  return toApiLocale(articleLocale) === toApiLocale(locale);
}

export async function getCmsArticles(params: GetCmsArticlesParams): Promise<GetCmsArticlesResult> {
  const allowLocalFallback = params.allowLocalFallback !== false;
  const requestedPage = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const requestedPerPage =
    typeof params.perPage === "number" && params.perPage > 0
      ? Math.min(params.perPage, DEFAULT_ENUMERATION_PER_PAGE)
      : DEFAULT_LIST_PER_PAGE;
  const query = buildQuery({
    locale: toApiLocale(params.locale),
    page: requestedPage,
    per_page: requestedPerPage,
    org_id: DEFAULT_ORG_ID,
    related_test_slug: params.relatedTestSlug,
    voice: params.voice,
  });
  const cacheOptions =
    allowLocalFallback
      ? PUBLIC_API_CACHE_OPTIONS
      : ({ cache: "no-store" } as const);

  try {
    const response = await apiClient.get<CmsArticlesApiResponse>(`/v0.5/articles${query}`, {
      locale: params.locale,
      skipAuth: true,
      ...cacheOptions,
    });

    const items = Array.isArray(response.items)
      ? response.items
          .map(normalizeArticle)
          .filter((article) => article.slug && article.title)
          .filter((article) => matchesRequestedLocale(article.locale, params.locale))
      : [];

    return {
      items,
      pagination: {
        currentPage: typeof response.pagination?.current_page === "number" ? response.pagination.current_page : requestedPage,
        perPage: typeof response.pagination?.per_page === "number" ? response.pagination.per_page : requestedPerPage,
        total: typeof response.pagination?.total === "number" ? response.pagination.total : items.length,
        lastPage: typeof response.pagination?.last_page === "number" ? response.pagination.last_page : 1,
      },
      landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && allowLocalFallback) {
      return {
        items: [],
        pagination: {
          currentPage: requestedPage,
          perPage: requestedPerPage,
          total: 0,
          lastPage: 1,
        },
        landingSurface: null,
      };
    }

    throw error;
  }
}

export async function getCmsArticlesWithLastKnownGood(
  params: GetCmsArticlesParams
): Promise<LastKnownGoodResult<GetCmsArticlesResult>> {
  const locale = normalizeLocale(params.locale);
  const page = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const perPage =
    typeof params.perPage === "number" && params.perPage > 0
      ? Math.min(params.perPage, DEFAULT_ENUMERATION_PER_PAGE)
      : DEFAULT_LIST_PER_PAGE;
  const related = params.relatedTestSlug ? `:${params.relatedTestSlug}` : "";
  const voice = params.voice ? `:${params.voice}` : "";

  return withLastKnownGood({
    key: `articles:list:${locale}:${page}:${perPage}${related}${voice}`,
    load: () => getCmsArticles({ ...params, locale, page, perPage }),
    isUsable: (result) => result.items.length > 0,
    useStaleOnUnusable: true,
  });
}

export async function listCmsArticlesForLlms(
  params: ListCmsArticlesForLlmsParams
): Promise<CmsArticleLlmsEntry[]> {
  const locale = normalizeLocale(params.locale);
  const perPage =
    typeof params.perPage === "number" && params.perPage > 0
      ? Math.min(params.perPage, DEFAULT_ENUMERATION_PER_PAGE)
      : DEFAULT_ENUMERATION_PER_PAGE;
  const seen = new Set<string>();
  const entries: CmsArticleLlmsEntry[] = [];

  let currentPage = 1;
  let lastPage = 1;

  do {
    const response = await getCmsArticles({
      locale,
      page: currentPage,
      perPage,
    });

    lastPage = Math.max(1, response.pagination.lastPage);

    for (const article of response.items) {
      const slug = normalizeArticleSlug(article.slug);
      const title = fallbackText(article.title);
      if (!slug || !title) {
        continue;
      }

      const key = `${locale}:${slug}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      entries.push({
        slug,
        locale,
        title,
        excerpt: article.excerpt,
        href: buildArticleFrontendUrl(locale, slug),
        isIndexable: article.isIndexable,
        updatedAt: article.updatedAt ?? article.publishedAt ?? article.createdAt,
      });
    }

    currentPage += 1;
  } while (currentPage <= lastPage);

  return entries;
}

export async function listCmsArticlesForLlmsWithLastKnownGood(
  params: ListCmsArticlesForLlmsParams
): Promise<LastKnownGoodResult<CmsArticleLlmsEntry[]>> {
  const locale = normalizeLocale(params.locale);
  const perPage =
    typeof params.perPage === "number" && params.perPage > 0
      ? Math.min(params.perPage, DEFAULT_ENUMERATION_PER_PAGE)
      : DEFAULT_ENUMERATION_PER_PAGE;

  return withLastKnownGood({
    key: `articles:llms:${locale}:${perPage}`,
    load: () => listCmsArticlesForLlms({ locale, perPage }),
    isUsable: (entries) => entries.length > 0,
    useStaleOnUnusable: true,
  });
}

export async function getCmsArticle(slug: string, locale: Locale | string): Promise<CmsArticle | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsArticleApiResponse>(`/v0.5/articles/${encodeURIComponent(normalizedSlug)}${query}`, {
      locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    if (!response.article) {
      return null;
    }

    const article = normalizeArticle(response.article);
    article.landingSurface = normalizeLandingSurface(response.landing_surface_v1 ?? null);
    article.answerSurface = normalizeAnswerSurface(response.answer_surface_v1 ?? null);
    return article.slug && article.title ? article : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCmsArticleWithLastKnownGood(
  slug: string,
  locale: Locale | string
): Promise<LastKnownGoodResult<CmsArticle | null>> {
  const normalizedSlug = normalizeArticleSlug(slug);
  const normalizedLocale = normalizeLocale(locale);

  return withLastKnownGood({
    key: `articles:detail:${normalizedLocale}:${normalizedSlug}`,
    load: () => getCmsArticle(normalizedSlug, normalizedLocale),
    isUsable: (article) => Boolean(article?.slug && article.title),
    useStaleOnUnusable: true,
  });
}

export async function getCmsArticleSeo(slug: string, locale: Locale | string): Promise<CmsArticleSeoPayload | null> {
  const normalizedSlug = normalizeArticleSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsArticleSeoApiResponse>(
      `/v0.5/articles/${encodeURIComponent(normalizedSlug)}/seo${query}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return normalizeArticleSeoPayload(response, locale, normalizedSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCmsArticleSeoWithLastKnownGood(
  slug: string,
  locale: Locale | string
): Promise<LastKnownGoodResult<CmsArticleSeoPayload | null>> {
  const normalizedSlug = normalizeArticleSlug(slug);
  const normalizedLocale = normalizeLocale(locale);

  return withLastKnownGood({
    key: `articles:seo:${normalizedLocale}:${normalizedSlug}`,
    load: () => getCmsArticleSeo(normalizedSlug, normalizedLocale),
    isUsable: (seo) => Boolean(seo?.meta.title && seo.meta.description),
    useStaleOnUnusable: true,
  });
}
