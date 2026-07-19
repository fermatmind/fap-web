import { apiClient } from "@/lib/api-client";
import { localizedPath, normalizeLocale, toApiLocale, type Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { isAuthoritativePublicAbsence } from "@/lib/public-content/readError";
import { normalizePublicReview, type PublicReview } from "@/lib/public-content/publicReview";

const DEFAULT_ORG_ID = "0";
export const MAX_SUPPORT_SLUG_LENGTH = 128;
const SUPPORT_SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export type SupportArticle = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  bodyHtml: string;
  supportCategory: string;
  supportIntent: string;
  locale: Locale;
  status: string;
  publicReview: PublicReview;
  reviewState: string;
  primaryCtaLabel: string | null;
  primaryCtaUrl: string | null;
  relatedSupportArticleIds: number[];
  relatedContentPageIds: number[];
  publishedAt: string | null;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string;
};

export type InterpretationGuide = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  bodyHtml: string;
  testFamily: string;
  resultContext: string;
  audience: string;
  locale: Locale;
  status: string;
  publicReview: PublicReview;
  reviewState: string;
  relatedGuideIds: number[];
  relatedMethodologyPageIds: number[];
  publishedAt: string | null;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string;
};

type SupportArticleApiRecord = {
  id?: number;
  slug?: string;
  title?: string;
  summary?: string | null;
  body_md?: string | null;
  body_html?: string | null;
  support_category?: string | null;
  support_intent?: string | null;
  locale?: string | null;
  status?: string | null;
  review_state?: string | null;
  last_reviewed_at?: unknown;
  reviewer?: unknown;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  related_support_article_ids?: unknown;
  related_content_page_ids?: unknown;
  published_at?: string | null;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_path?: string | null;
};

type InterpretationGuideApiRecord = {
  id?: number;
  slug?: string;
  title?: string;
  summary?: string | null;
  body_md?: string | null;
  body_html?: string | null;
  test_family?: string | null;
  result_context?: string | null;
  audience?: string | null;
  locale?: string | null;
  status?: string | null;
  review_state?: string | null;
  last_reviewed_at?: unknown;
  reviewer?: unknown;
  related_guide_ids?: unknown;
  related_methodology_page_ids?: unknown;
  published_at?: string | null;
  updated_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_path?: string | null;
};

type SupportArticlesResponse = {
  ok?: boolean;
  items?: SupportArticleApiRecord[];
  article?: SupportArticleApiRecord | null;
};

type InterpretationGuidesResponse = {
  ok?: boolean;
  items?: InterpretationGuideApiRecord[];
  guide?: InterpretationGuideApiRecord | null;
};

function buildQuery(locale: Locale | string): string {
  const params = new URLSearchParams({
    locale: toApiLocale(locale),
    org_id: DEFAULT_ORG_ID,
  });

  return `?${params.toString()}`;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeSupportSlug(value: unknown): string | null {
  const slug = normalizeText(value);
  if (!slug || slug.length > MAX_SUPPORT_SLUG_LENGTH || !SUPPORT_SLUG_PATTERN.test(slug)) {
    return null;
  }

  return slug;
}

function normalizeDate(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizeSupportArticle(record: SupportArticleApiRecord | null | undefined): SupportArticle | null {
  const slug = normalizeText(record?.slug);
  const title = normalizeText(record?.title);
  if (!slug || !title) {
    return null;
  }

  const publicReview = normalizePublicReview(record);

  return {
    id: Number(record?.id ?? 0) || 0,
    slug,
    title,
    summary: normalizeText(record?.summary),
    bodyMd: String(record?.body_md ?? "").trim(),
    bodyHtml: String(record?.body_html ?? "").trim(),
    supportCategory: normalizeText(record?.support_category),
    supportIntent: normalizeText(record?.support_intent),
    locale: normalizeLocale(record?.locale),
    status: normalizeText(record?.status),
    publicReview,
    reviewState: publicReview.reviewState,
    primaryCtaLabel: normalizeText(record?.primary_cta_label) || null,
    primaryCtaUrl: normalizeText(record?.primary_cta_url) || null,
    relatedSupportArticleIds: normalizeIds(record?.related_support_article_ids),
    relatedContentPageIds: normalizeIds(record?.related_content_page_ids),
    publishedAt: normalizeDate(record?.published_at),
    updatedAt: normalizeDate(record?.updated_at),
    seoTitle: normalizeText(record?.seo_title) || null,
    seoDescription: normalizeText(record?.seo_description) || null,
    canonicalPath: normalizeText(record?.canonical_path) || `/support/articles/${slug}`,
  };
}

function normalizeInterpretationGuide(record: InterpretationGuideApiRecord | null | undefined): InterpretationGuide | null {
  const slug = normalizeText(record?.slug);
  const title = normalizeText(record?.title);
  if (!slug || !title) {
    return null;
  }

  const publicReview = normalizePublicReview(record);

  return {
    id: Number(record?.id ?? 0) || 0,
    slug,
    title,
    summary: normalizeText(record?.summary),
    bodyMd: String(record?.body_md ?? "").trim(),
    bodyHtml: String(record?.body_html ?? "").trim(),
    testFamily: normalizeText(record?.test_family),
    resultContext: normalizeText(record?.result_context),
    audience: normalizeText(record?.audience),
    locale: normalizeLocale(record?.locale),
    status: normalizeText(record?.status),
    publicReview,
    reviewState: publicReview.reviewState,
    relatedGuideIds: normalizeIds(record?.related_guide_ids),
    relatedMethodologyPageIds: normalizeIds(record?.related_methodology_page_ids),
    publishedAt: normalizeDate(record?.published_at),
    updatedAt: normalizeDate(record?.updated_at),
    seoTitle: normalizeText(record?.seo_title) || null,
    seoDescription: normalizeText(record?.seo_description) || null,
    canonicalPath: normalizeText(record?.canonical_path) || `/support/guides/${slug}`,
  };
}

export function buildSupportArticlePath(slug: string, locale: Locale): string {
  return localizedPath(`/support/articles/${slug}`, locale);
}

export function buildInterpretationGuidePath(slug: string, locale: Locale): string {
  return localizedPath(`/support/guides/${slug}`, locale);
}

export async function listSupportArticles(locale: Locale | string): Promise<SupportArticle[]> {
  try {
    const response = await apiClient.getPublic<SupportArticlesResponse>(`/v0.5/support/articles${buildQuery(locale)}`, {
      locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    return Array.isArray(response.items)
      ? response.items.map(normalizeSupportArticle).filter((item): item is SupportArticle => item !== null)
      : [];
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return [];
    }

    throw error;
  }
}

export async function getSupportArticle(slug: string, locale: Locale | string): Promise<SupportArticle | null> {
  const normalizedSlug = normalizeSupportSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  try {
    const response = await apiClient.getPublic<SupportArticlesResponse>(
      `/v0.5/support/articles/${encodeURIComponent(normalizedSlug)}${buildQuery(locale)}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return normalizeSupportArticle(response.article);
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}

export async function listInterpretationGuides(locale: Locale | string): Promise<InterpretationGuide[]> {
  try {
    const response = await apiClient.getPublic<InterpretationGuidesResponse>(`/v0.5/support/guides${buildQuery(locale)}`, {
      locale,
      skipAuth: true,
      ...PUBLIC_API_CACHE_OPTIONS,
    });

    return Array.isArray(response.items)
      ? response.items.map(normalizeInterpretationGuide).filter((item): item is InterpretationGuide => item !== null)
      : [];
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return [];
    }

    throw error;
  }
}

export async function getInterpretationGuide(slug: string, locale: Locale | string): Promise<InterpretationGuide | null> {
  const normalizedSlug = normalizeSupportSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  try {
    const response = await apiClient.getPublic<InterpretationGuidesResponse>(
      `/v0.5/support/guides/${encodeURIComponent(normalizedSlug)}${buildQuery(locale)}`,
      {
        locale,
        skipAuth: true,
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    return normalizeInterpretationGuide(response.guide);
  } catch (error) {
    if (isAuthoritativePublicAbsence(error)) {
      return null;
    }

    throw error;
  }
}
