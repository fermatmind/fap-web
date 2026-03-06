import { ApiError, apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

const DEFAULT_ORG_ID = "0";

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
};

type CmsArticleSeoApiResponse = {
  meta?: {
    title?: string;
    description?: string;
    canonical?: string | null;
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
};

export type CmsArticleSeoPayload = {
  meta: {
    title: string;
    description: string;
    canonical: string | null;
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
};

export type GetCmsArticlesResult = {
  items: CmsArticle[];
  pagination: CmsArticlesPagination;
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
    slug: String(article.slug ?? "").trim(),
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
  };
}

function matchesRequestedLocale(articleLocale: string, locale: Locale | string): boolean {
  return toApiLocale(articleLocale) === toApiLocale(locale);
}

function emptyPagination(page = 1): CmsArticlesPagination {
  return {
    currentPage: page,
    perPage: 20,
    total: 0,
    lastPage: 1,
  };
}

export async function getCmsArticles(params: GetCmsArticlesParams): Promise<GetCmsArticlesResult> {
  const requestedPage = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const query = buildQuery({
    locale: toApiLocale(params.locale),
    page: requestedPage,
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

    return {
      items,
      pagination: {
        currentPage: typeof response.pagination?.current_page === "number" ? response.pagination.current_page : requestedPage,
        perPage: typeof response.pagination?.per_page === "number" ? response.pagination.per_page : 20,
        total: typeof response.pagination?.total === "number" ? response.pagination.total : items.length,
        lastPage: typeof response.pagination?.last_page === "number" ? response.pagination.last_page : 1,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        items: [],
        pagination: emptyPagination(requestedPage),
      };
    }

    throw error;
  }
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
      return null;
    }

    const article = normalizeArticle(response.article);
    return article.slug && article.title ? article : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCmsArticleSeo(slug: string, locale: Locale | string): Promise<CmsArticleSeoPayload | null> {
  const normalizedSlug = slug.trim();
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

    return {
      meta: {
        title: String(response.meta?.title ?? "").trim(),
        description: String(response.meta?.description ?? "").trim(),
        canonical: response.meta?.canonical ?? null,
        og: {
          title: String(response.meta?.og?.title ?? response.meta?.title ?? "").trim(),
          description: String(response.meta?.og?.description ?? response.meta?.description ?? "").trim(),
          image: response.meta?.og?.image ?? null,
          type: String(response.meta?.og?.type ?? "article").trim() || "article",
        },
        twitter: {
          card: String(response.meta?.twitter?.card ?? "summary_large_image").trim() || "summary_large_image",
          title: String(response.meta?.twitter?.title ?? response.meta?.title ?? "").trim(),
          description: String(response.meta?.twitter?.description ?? response.meta?.description ?? "").trim(),
          image: response.meta?.twitter?.image ?? response.meta?.og?.image ?? null,
        },
        robots: String(response.meta?.robots ?? "index,follow").trim() || "index,follow",
      },
      jsonld: response.jsonld ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
