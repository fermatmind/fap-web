import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw, SeoSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import {
  getCareerGuideCmsLocalFallback,
  listCareerGuideCmsLocalFallback,
} from "@/lib/cms/career-guide-local-fallback";
import { buildPersonalityFrontendUrl } from "@/lib/cms/personality";
import { getCareerIndustryBySlug, type RelatedContentItem } from "@/lib/content";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { normalizeSeoSurface, type SeoSurfaceViewModel } from "@/lib/seo/seoSurface";
import { canonicalUrl } from "@/lib/site";

const DEFAULT_ORG_ID = "0";
const DEFAULT_LIST_PER_PAGE = 20;
const DEFAULT_ENUMERATION_PER_PAGE = 100;

type CmsCareerGuideApiRecord = {
  id?: number;
  org_id?: number;
  guide_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string | null;
  category_slug?: string | null;
  body_md?: string | null;
  body_html?: string | null;
  is_public?: boolean;
  is_indexable?: boolean;
  published_at?: string | null;
  updated_at?: string | null;
};

type CmsCareerGuideJobApiRecord = {
  id?: number;
  job_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string | null;
  industry_slug?: string | null;
  industry_label?: string | null;
};

type CmsCareerGuideArticleApiRecord = {
  id?: number;
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string | null;
  published_at?: string | null;
};

type CmsCareerGuidePersonalityApiRecord = {
  id?: number;
  type_code?: string;
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string | null;
};

type CmsCareerGuideSeoMetaApiRecord = {
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_url?: string | null;
  robots?: string | null;
  jsonld_overrides_json?: unknown;
} | null;

type CmsCareerGuideListApiResponse = {
  ok?: boolean;
  items?: CmsCareerGuideApiRecord[];
  pagination?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };
};

type CmsCareerGuideDetailApiResponse = {
  ok?: boolean;
  guide?: CmsCareerGuideApiRecord | null;
  related_jobs?: CmsCareerGuideJobApiRecord[];
  related_industries?: string[];
  related_articles?: CmsCareerGuideArticleApiRecord[];
  related_personality_profiles?: CmsCareerGuidePersonalityApiRecord[];
  seo_meta?: CmsCareerGuideSeoMetaApiRecord;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

type CmsCareerGuideSeoApiResponse = {
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

export type ListCareerGuidesOptions = {
  page?: number;
  perPage?: number;
  category?: string;
};

export type CareerGuideSeoMetaSummary = {
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  robots: string | null;
  jsonldOverrides: unknown;
};

export type CareerGuideListItem = {
  id: number | null;
  orgId: number;
  guideCode: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  category: string;
  categorySlug: string;
  href: string;
  isPublic: boolean;
  isIndexable: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type CareerGuideDetailViewModel = CareerGuideListItem & {
  bodyMd: string;
  bodyHtml: string;
  relatedJobs: RelatedContentItem[];
  relatedIndustries: RelatedContentItem[];
  relatedArticles: RelatedContentItem[];
  relatedPersonalityProfiles: RelatedContentItem[];
  seoMeta: CareerGuideSeoMetaSummary | null;
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

export type CareerGuideSeoViewModel = {
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

function extractPlainText(markdown: string): string {
  const withoutCode = markdown.replace(/`{1,3}[^`]*`{1,3}/g, " ");
  const withoutLinks = withoutCode.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  const withoutMarkdown = withoutLinks.replace(/[#>*_~\-]+/g, " ");

  return withoutMarkdown.replace(/\s+/g, " ").trim();
}

function extractHtmlText(html: string): string {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeItems(items: RelatedContentItem[]): RelatedContentItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.href}:${item.slug}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeCareerGuideSeoMeta(
  seoMeta: CmsCareerGuideSeoMetaApiRecord
): CareerGuideSeoMetaSummary | null {
  if (!seoMeta || typeof seoMeta !== "object") {
    return null;
  }

  return {
    seoTitle: fallbackText(seoMeta.seo_title) || null,
    seoDescription: fallbackText(seoMeta.seo_description) || null,
    canonicalUrl: normalizeIsoValue(seoMeta.canonical_url),
    ogTitle: fallbackText(seoMeta.og_title) || null,
    ogDescription: fallbackText(seoMeta.og_description) || null,
    ogImageUrl: normalizeIsoValue(seoMeta.og_image_url),
    twitterTitle: fallbackText(seoMeta.twitter_title) || null,
    twitterDescription: fallbackText(seoMeta.twitter_description) || null,
    twitterImageUrl: normalizeIsoValue(seoMeta.twitter_image_url),
    robots: fallbackText(seoMeta.robots) || null,
    jsonldOverrides: seoMeta.jsonld_overrides_json ?? null,
  };
}

export function mapFrontendLocaleToCareerGuideApiLocale(
  locale: Locale | string
): "en" | "zh-CN" {
  return toApiLocale(locale);
}

export function normalizeCareerGuideSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function buildCareerGuideFrontendUrl(
  locale: Locale | string,
  slug: string
): string {
  return localizedPath(
    `/career/guides/${normalizeCareerGuideSlug(slug)}`,
    normalizeLocale(locale)
  );
}

function matchesRequestedLocale(value: string, locale: Locale | string): boolean {
  return toApiLocale(value) === toApiLocale(locale);
}

function adaptCareerGuideListItem(
  raw: CmsCareerGuideApiRecord,
  locale: Locale | string
): CareerGuideListItem | null {
  const slug = normalizeCareerGuideSlug(String(raw.slug ?? raw.guide_code ?? ""));
  const title = fallbackText(raw.title);
  if (!slug || !title) {
    return null;
  }

  const categorySlug = fallbackText(raw.category_slug);

  return {
    id: typeof raw.id === "number" ? raw.id : null,
    orgId: typeof raw.org_id === "number" ? raw.org_id : 0,
    guideCode: fallbackText(raw.guide_code, slug),
    slug,
    locale: fallbackText(raw.locale, mapFrontendLocaleToCareerGuideApiLocale(locale)),
    title,
    summary: fallbackText(raw.excerpt),
    category: categorySlug,
    categorySlug,
    href: buildCareerGuideFrontendUrl(locale, slug),
    isPublic: Boolean(raw.is_public),
    isIndexable: Boolean(raw.is_indexable),
    publishedAt: normalizeIsoValue(raw.published_at),
    updatedAt: normalizeIsoValue(raw.updated_at),
  };
}

function adaptRelatedJob(
  raw: CmsCareerGuideJobApiRecord,
  locale: Locale | string
): RelatedContentItem | null {
  const slug = normalizeCareerGuideSlug(String(raw.slug ?? raw.job_code ?? ""));
  const title = fallbackText(raw.title);
  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    href: localizedPath(`/career/jobs/${slug}`, normalizeLocale(locale)),
    summary: fallbackText(raw.excerpt),
  };
}

function adaptRelatedIndustry(
  rawSlug: string,
  locale: Locale | string
): RelatedContentItem | null {
  const slug = normalizeCareerGuideSlug(rawSlug);
  if (!slug) {
    return null;
  }

  const industry = getCareerIndustryBySlug(slug, normalizeLocale(locale));
  if (!industry) {
    return null;
  }

  return {
    slug: industry.slug,
    title: industry.title,
    href: localizedPath(`/career/industries/${industry.slug}`, normalizeLocale(locale)),
    summary: industry.summary,
  };
}

function adaptRelatedArticle(
  raw: CmsCareerGuideArticleApiRecord,
  locale: Locale | string
): RelatedContentItem | null {
  const slug = normalizeCareerGuideSlug(String(raw.slug ?? ""));
  const title = fallbackText(raw.title);
  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    href: localizedPath(`/articles/${slug}`, normalizeLocale(locale)),
    summary: fallbackText(raw.excerpt),
  };
}

function adaptRelatedPersonalityProfile(
  raw: CmsCareerGuidePersonalityApiRecord,
  locale: Locale | string
): RelatedContentItem | null {
  const slug = normalizeCareerGuideSlug(String(raw.slug ?? raw.type_code ?? ""));
  const title = fallbackText(raw.title, raw.type_code);
  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    href: buildPersonalityFrontendUrl(locale, slug),
    summary: fallbackText(raw.excerpt),
  };
}

export function adaptCareerGuideDetail(
  response: CmsCareerGuideDetailApiResponse,
  locale: Locale | string
): CareerGuideDetailViewModel | null {
  if (!response.guide) {
    return null;
  }

  const guide = adaptCareerGuideListItem(response.guide, locale);
  if (!guide) {
    return null;
  }

  return {
    ...guide,
    bodyMd: String(response.guide?.body_md ?? ""),
    bodyHtml: String(response.guide?.body_html ?? ""),
    relatedJobs: dedupeItems(
      Array.isArray(response.related_jobs)
        ? response.related_jobs
            .map((item) => adaptRelatedJob(item, locale))
            .filter((item): item is RelatedContentItem => item !== null)
        : []
    ),
    relatedIndustries: dedupeItems(
      Array.isArray(response.related_industries)
        ? response.related_industries
            .map((item) => adaptRelatedIndustry(item, locale))
            .filter((item): item is RelatedContentItem => item !== null)
        : []
    ),
    relatedArticles: dedupeItems(
      Array.isArray(response.related_articles)
        ? response.related_articles
            .map((item) => adaptRelatedArticle(item, locale))
            .filter((item): item is RelatedContentItem => item !== null)
        : []
    ),
    relatedPersonalityProfiles: dedupeItems(
      Array.isArray(response.related_personality_profiles)
        ? response.related_personality_profiles
            .map((item) => adaptRelatedPersonalityProfile(item, locale))
            .filter((item): item is RelatedContentItem => item !== null)
        : []
    ),
    seoMeta: normalizeCareerGuideSeoMeta(response.seo_meta ?? null),
    landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
    answerSurface: normalizeAnswerSurface(response.answer_surface_v1 ?? null),
  };
}

function buildFallbackCareerGuideJsonLd(
  guide: CareerGuideDetailViewModel,
  locale: Locale
): Record<string, unknown> {
  const url = canonicalUrl(buildCareerGuideFrontendUrl(locale, guide.slug));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: guide.title,
    description: guide.summary,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    mainEntityOfPage: url,
  };
}

function replaceCanonicalValue(
  value: string,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string
): string {
  const normalizedCanonical = canonicalUrl(localizedCanonicalPath);
  const normalizedSourceCanonical = String(sourceCanonical ?? "").trim();

  if (normalizedSourceCanonical) {
    if (value === normalizedSourceCanonical) {
      return normalizedCanonical;
    }

    if (value.startsWith(`${normalizedSourceCanonical}#`)) {
      return `${normalizedCanonical}${value.slice(normalizedSourceCanonical.length)}`;
    }
  }

  return value;
}

function normalizeCareerGuideJsonLd(
  jsonld: unknown,
  sourceCanonical: string | null | undefined,
  localizedCanonicalPath: string,
  guide: CareerGuideDetailViewModel,
  locale: Locale
): unknown {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, nested]) => [key, walk(nested)])
      );
    }

    if (typeof value === "string") {
      return replaceCanonicalValue(value, sourceCanonical, localizedCanonicalPath);
    }

    return value;
  };

  if (!jsonld) {
    return buildFallbackCareerGuideJsonLd(guide, locale);
  }

  return walk(jsonld);
}

export function normalizeCareerGuideSeoPayload(
  seo: CareerGuideSeoViewModel | null,
  guide: CareerGuideDetailViewModel,
  locale: Locale | string
): CareerGuideSeoViewModel {
  const normalizedLocale = normalizeLocale(locale);
  const canonicalPath = buildCareerGuideFrontendUrl(normalizedLocale, guide.slug);
  const normalizedCanonical = canonicalUrl(canonicalPath);
  const fallbackDescription =
    fallbackText(
      guide.summary,
      extractPlainText(guide.bodyMd),
      extractHtmlText(guide.bodyHtml),
      guide.title
    ) || guide.title;

  return {
    meta: {
      title: fallbackText(seo?.meta.title, guide.seoMeta?.seoTitle, guide.title),
      description: fallbackText(
        seo?.meta.description,
        guide.seoMeta?.seoDescription,
        fallbackDescription
      ),
      canonical: normalizedCanonical,
      alternates: {
        en: canonicalUrl(buildCareerGuideFrontendUrl("en", guide.slug)),
        "zh-CN": canonicalUrl(buildCareerGuideFrontendUrl("zh", guide.slug)),
      },
      og: {
        title: fallbackText(seo?.meta.og.title, guide.seoMeta?.ogTitle, seo?.meta.title, guide.title),
        description: fallbackText(
          seo?.meta.og.description,
          guide.seoMeta?.ogDescription,
          seo?.meta.description,
          guide.seoMeta?.seoDescription,
          fallbackDescription
        ),
        image: normalizeIsoValue(seo?.meta.og.image ?? guide.seoMeta?.ogImageUrl),
        type: fallbackText(seo?.meta.og.type, "article"),
      },
      twitter: {
        card: fallbackText(seo?.meta.twitter.card, "summary_large_image"),
        title: fallbackText(
          seo?.meta.twitter.title,
          guide.seoMeta?.twitterTitle,
          seo?.meta.og.title,
          seo?.meta.title,
          guide.title
        ),
        description: fallbackText(
          seo?.meta.twitter.description,
          guide.seoMeta?.twitterDescription,
          seo?.meta.og.description,
          seo?.meta.description,
          fallbackDescription
        ),
        image: normalizeIsoValue(
          seo?.meta.twitter.image ??
            guide.seoMeta?.twitterImageUrl ??
            guide.seoMeta?.ogImageUrl ??
            seo?.meta.og.image
        ),
      },
      robots: fallbackText(
        seo?.meta.robots,
        guide.seoMeta?.robots,
        guide.isIndexable ? "index,follow" : "noindex,follow"
      ),
    },
    jsonld: normalizeCareerGuideJsonLd(
      seo?.jsonld ?? null,
      seo?.meta.canonical ?? guide.seoMeta?.canonicalUrl,
      canonicalPath,
      guide,
      normalizedLocale
    ),
    surface: seo?.surface ?? null,
  };
}

export async function listCareerGuidesFromCms(
  locale: Locale | string,
  options: ListCareerGuidesOptions = {}
): Promise<CareerGuideListItem[]> {
  const requestedPage =
    typeof options.page === "number" && options.page > 0 ? options.page : undefined;
  const requestedPerPage =
    typeof options.perPage === "number" && options.perPage > 0
      ? Math.min(options.perPage, DEFAULT_ENUMERATION_PER_PAGE)
      : undefined;
  const enumerateAll = requestedPage === undefined && requestedPerPage === undefined;
  const perPage = requestedPerPage ?? (enumerateAll ? DEFAULT_ENUMERATION_PER_PAGE : DEFAULT_LIST_PER_PAGE);
  const items: CareerGuideListItem[] = [];
  const seen = new Set<string>();

  let currentPage = requestedPage ?? 1;
  let lastPage = currentPage;

  try {
    do {
      const query = buildQuery({
        locale: mapFrontendLocaleToCareerGuideApiLocale(locale),
        org_id: DEFAULT_ORG_ID,
        page: currentPage,
        per_page: perPage,
        category: fallbackText(options.category) || undefined,
      });

      const response = await apiClient.get<CmsCareerGuideListApiResponse>(
        `/v0.5/career-guides${query}`,
        {
          locale,
          skipAuth: true,
          ...PUBLIC_API_CACHE_OPTIONS,
        }
      );

      const pageItems = Array.isArray(response.items)
        ? response.items
            .map((item) => adaptCareerGuideListItem(item, locale))
            .filter((item): item is CareerGuideListItem => item !== null)
            .filter((item) => matchesRequestedLocale(item.locale, locale))
        : [];

      for (const item of pageItems) {
        const key = `${item.locale}:${item.slug}`;
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        items.push(item);
      }

      if (!enumerateAll) {
        break;
      }

      lastPage =
        typeof response.pagination?.last_page === "number"
          ? response.pagination.last_page
          : currentPage;
      currentPage += 1;
    } while (currentPage <= lastPage);

    return items.length > 0 ? items : listCareerGuideCmsLocalFallback(locale, options.category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return listCareerGuideCmsLocalFallback(locale, options.category);
    }

    return listCareerGuideCmsLocalFallback(locale, options.category);
  }
}

export async function getCareerGuideFromCmsBySlug(
  slug: string,
  locale: Locale | string
): Promise<CareerGuideDetailViewModel | null> {
  const normalizedSlug = normalizeCareerGuideSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToCareerGuideApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerGuideDetailApiResponse>(
      `/v0.5/career-guides/${encodeURIComponent(normalizedSlug)}${query}`,
      {
        locale,
        skipAuth: true,
        cache: "no-store",
      }
    );

    const guide = adaptCareerGuideDetail(response, locale);
    if (guide && matchesRequestedLocale(guide.locale, locale)) {
      return guide;
    }

    return getCareerGuideCmsLocalFallback(normalizedSlug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return getCareerGuideCmsLocalFallback(normalizedSlug, locale);
    }

    return getCareerGuideCmsLocalFallback(normalizedSlug, locale);
  }
}

export async function getCareerGuideSeoFromCmsBySlug(
  slug: string,
  locale: Locale | string
): Promise<CareerGuideSeoViewModel | null> {
  const normalizedSlug = normalizeCareerGuideSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  const query = buildQuery({
    locale: mapFrontendLocaleToCareerGuideApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  try {
    const response = await apiClient.get<CmsCareerGuideSeoApiResponse>(
      `/v0.5/career-guides/${encodeURIComponent(normalizedSlug)}/seo${query}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return {
      meta: {
        title: fallbackText(response.meta?.title),
        description: fallbackText(response.meta?.description),
        canonical: normalizeIsoValue(response.meta?.canonical),
        alternates: {
          en: normalizeIsoValue(response.meta?.alternates?.en),
          "zh-CN": normalizeIsoValue(response.meta?.alternates?.["zh-CN"]),
        },
        og: {
          title: fallbackText(response.meta?.og?.title, response.meta?.title),
          description: fallbackText(response.meta?.og?.description, response.meta?.description),
          image: normalizeIsoValue(response.meta?.og?.image),
          type: fallbackText(response.meta?.og?.type, "article"),
        },
        twitter: {
          card: fallbackText(response.meta?.twitter?.card, "summary_large_image"),
          title: fallbackText(response.meta?.twitter?.title, response.meta?.title),
          description: fallbackText(
            response.meta?.twitter?.description,
            response.meta?.description
          ),
          image: normalizeIsoValue(
            response.meta?.twitter?.image ?? response.meta?.og?.image
          ),
        },
        robots: fallbackText(response.meta?.robots, "index,follow"),
      },
      jsonld: response.jsonld ?? null,
      surface: normalizeSeoSurface(response.seo_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
