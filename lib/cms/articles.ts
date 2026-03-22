import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { getBlogPostBySlug, listBlogPosts, type LocalizedBlogPost } from "@/lib/content";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
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
  cover_image_url?: string | null;
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

export type CmsArticle = {
  id: number | null;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  contentMd: string;
  contentHtml: string;
  coverImageUrl: string | null;
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
  return {
    id: typeof article.id === "number" ? article.id : null,
    slug: normalizeArticleSlug(String(article.slug ?? "")),
    locale: String(article.locale ?? "").trim() || "en",
    title: String(article.title ?? "").trim(),
    excerpt: buildFallbackExcerpt(article),
    contentMd: String(article.content_md ?? ""),
    contentHtml: String(article.content_html ?? ""),
    coverImageUrl: typeof article.cover_image_url === "string" && article.cover_image_url.trim() ? article.cover_image_url : null,
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

function normalizeLocalTag(tag: unknown): CmsArticleTag | null {
  const name = String(tag ?? "").trim();
  if (!name) {
    return null;
  }

  return {
    id: null,
    slug: name,
    name,
  };
}

function normalizeLocalArticle(post: LocalizedBlogPost): CmsArticle {
  return {
    id: null,
    slug: normalizeArticleSlug(post.slug),
    locale: toApiLocale(post.locale),
    title: String(post.title ?? "").trim(),
    excerpt: fallbackText(post.summary),
    contentMd: String(post.body ?? ""),
    contentHtml: "",
    coverImageUrl: null,
    status: "published",
    isPublic: true,
    isIndexable: post.locale === "zh" ? true : Boolean(post.translation_ready),
    publishedAt: normalizeIsoValue(post.publishedAt ?? post.updatedAt),
    scheduledAt: null,
    createdAt: null,
    updatedAt: normalizeIsoValue(post.updatedAt ?? post.publishedAt),
    category: null,
    tags: Array.isArray(post.tags)
      ? post.tags.map(normalizeLocalTag).filter((tag): tag is CmsArticleTag => tag !== null)
      : [],
    seoMeta: null,
    landingSurface: null,
    answerSurface: null,
  };
}

function getLocalArticle(slug: string, locale: Locale | string): CmsArticle | null {
  const post = getBlogPostBySlug(normalizeArticleSlug(slug), normalizeLocale(locale));
  if (!post) {
    return null;
  }

  const article = normalizeLocalArticle(post);
  return article.slug && article.title ? article : null;
}

function getLocalArticles(locale: Locale | string): CmsArticle[] {
  return listBlogPosts(normalizeLocale(locale))
    .map(normalizeLocalArticle)
    .filter((article) => article.slug && article.title);
}

function buildLocalArticlesResult(
  locale: Locale | string,
  requestedPage: number,
  requestedPerPage: number
): GetCmsArticlesResult {
  const all = getLocalArticles(locale);
  const total = all.length;
  const lastPage = Math.max(1, Math.ceil(total / requestedPerPage));
  const currentPage = Math.min(requestedPage, lastPage);
  const start = Math.max(0, (currentPage - 1) * requestedPerPage);

  return {
    items: all.slice(start, start + requestedPerPage),
    pagination: {
      currentPage,
      perPage: requestedPerPage,
      total,
      lastPage,
    },
    landingSurface: null,
  };
}

function matchesRequestedLocale(articleLocale: string, locale: Locale | string): boolean {
  return toApiLocale(articleLocale) === toApiLocale(locale);
}

export async function getCmsArticles(params: GetCmsArticlesParams): Promise<GetCmsArticlesResult> {
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
  });

  try {
    const response = await apiClient.get<CmsArticlesApiResponse>(`/v0.5/articles${query}`, {
      locale: params.locale,
      skipAuth: true,
      cache: "no-store",
    });

    const items = Array.isArray(response.items)
      ? response.items
          .map(normalizeArticle)
          .filter((article) => article.slug && article.title)
          .filter((article) => matchesRequestedLocale(article.locale, params.locale))
      : [];

    if (items.length === 0) {
      return buildLocalArticlesResult(params.locale, requestedPage, requestedPerPage);
    }

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
    if (error instanceof ApiError && error.status === 404) {
      return buildLocalArticlesResult(params.locale, requestedPage, requestedPerPage);
    }

    throw error;
  }
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
      cache: "no-store",
    });

    if (!response.article) {
      return getLocalArticle(normalizedSlug, locale);
    }

    const article = normalizeArticle(response.article);
    article.landingSurface = normalizeLandingSurface(response.landing_surface_v1 ?? null);
    article.answerSurface = normalizeAnswerSurface(response.answer_surface_v1 ?? null);
    return article.slug && article.title ? article : getLocalArticle(normalizedSlug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return getLocalArticle(normalizedSlug, locale);
    }

    throw error;
  }
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
        cache: "no-store",
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
