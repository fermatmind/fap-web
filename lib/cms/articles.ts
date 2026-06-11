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
export const MAX_ARTICLE_LIST_PAGE = 100;
export const MAX_ARTICLE_SLUG_LENGTH = 128;
const ARTICLE_SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const UNBOUNDED_ARTICLE_DETAIL_FETCH_OPTIONS = { cache: "no-store" } as const;

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
  related_test_slugs?: unknown;
  test_edges?: unknown;
  translation_group_id?: string | number | null;
  translationGroupId?: string | number | null;
  voice?: string | null;
  voice_order?: number | string | null;
  status?: string;
  is_public?: boolean;
  is_indexable?: boolean;
  sitemap_eligible?: boolean;
  llms_eligible?: boolean;
  published_revision_id?: number | string | null;
  publishedRevisionId?: number | string | null;
  published_revision?: unknown;
  publishedRevision?: unknown;
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

export type CmsArticleTestEdge = {
  testSlug: string;
  role: "primary" | "secondary" | "contextual" | string;
  locale: string | null;
  sortOrder: number | null;
  safetyLevel: "normal" | "sensitive" | string;
  visibility: "public" | "review" | "disabled" | string;
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
  relatedTestSlugs?: string[];
  testEdges?: CmsArticleTestEdge[];
  translationGroupId?: string | null;
  voice: string | null;
  voiceOrder: number | null;
  status: string;
  isPublic: boolean;
  isIndexable: boolean;
  sitemapEligible?: boolean;
  llmsEligible?: boolean;
  publishedRevisionId: number | null;
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
  llmsEligible?: boolean;
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
  maxPages?: number;
};

export const ARTICLE_RUNTIME_CONTRACT_VERSION = "article.runtime.v1";

export type ArticleRuntimeContractFeatureKey =
  | "visible_faq"
  | "visible_cta"
  | "related_test"
  | "related_topic"
  | "related_articles"
  | "evidence_citation"
  | "report_preview"
  | "claim_boundary_metadata";

export type ArticleRuntimeContractState = "backend_cms_provided" | "missing_deferred";

export type ArticleRuntimeContractFeature = {
  key: ArticleRuntimeContractFeatureKey;
  state: ArticleRuntimeContractState;
  source: string;
  visible: boolean;
  frontendFallbackPolicy: "forbidden_frontend_fallback";
  reason: string;
};

export type ArticleRuntimeContract = {
  version: typeof ARTICLE_RUNTIME_CONTRACT_VERSION;
  pageFamily: "article_detail";
  features: ArticleRuntimeContractFeature[];
};

function hasVisibleAnswerSurface(surface: AnswerSurfaceViewModel | null | undefined): boolean {
  return Boolean(
    surface
    && (
      surface.summaryBlocks.length > 0
      || surface.faqBlocks.length > 0
      || surface.compareBlocks.length > 0
      || surface.sceneSummaryBlocks.length > 0
      || surface.nextStepBlocks.length > 0
    )
  );
}

function hasVisibleArticleFaq(article: CmsArticle): boolean {
  return Boolean(
    article.answerSurface?.faqBlocks.some((item) => item.question.trim() && item.answer.trim())
  );
}

function hasVisibleArticleCta(article: CmsArticle): boolean {
  return Boolean(
    article.landingSurface?.ctaBundle.some((item) => item.label.trim() && item.href.trim())
    || article.answerSurface?.nextStepBlocks.some((item) => item.title.trim() && item.href)
  );
}

function hasBackendRelatedTest(article: CmsArticle): boolean {
  return Boolean(
    article.relatedTestSlug
    || (article.relatedTestSlugs?.length ?? 0) > 0
    || article.testEdges?.some((edge) => edge.visibility === "public" && edge.testSlug)
    || article.landingSurface?.startTestTarget
    || article.landingSurface?.ctaBundle.some((item) => item.kind === "start_test" && item.href)
    || article.answerSurface?.nextStepBlocks.some((item) => item.kind === "start_test" && item.href)
  );
}

function hasVisibleRelatedTest(article: CmsArticle): boolean {
  return Boolean(
    article.landingSurface?.ctaBundle.some((item) => item.kind === "start_test" && item.label && item.href)
    || article.answerSurface?.nextStepBlocks.some((item) => item.kind === "start_test" && item.title && item.href)
  );
}

function hasBackendRelatedTopic(article: CmsArticle): boolean {
  return Boolean(
    article.landingSurface?.ctaBundle.some((item) => item.key === "topic_hub" && item.href)
    || article.answerSurface?.nextStepBlocks.some((item) => item.key === "topic_hub" && item.href)
    || article.landingSurface?.relatedSurfaceKeys.includes("topic_hub")
    || article.answerSurface?.relatedSurfaceKeys.includes("topic_hub")
  );
}

function hasVisibleRelatedTopic(article: CmsArticle): boolean {
  return Boolean(
    article.landingSurface?.ctaBundle.some((item) => item.key === "topic_hub" && item.label && item.href)
    || article.answerSurface?.nextStepBlocks.some((item) => item.key === "topic_hub" && item.title && item.href)
  );
}

function articleRuntimeFeature(
  key: ArticleRuntimeContractFeatureKey,
  provided: boolean,
  visible: boolean,
  source: string,
  reason: string
): ArticleRuntimeContractFeature {
  return {
    key,
    state: provided ? "backend_cms_provided" : "missing_deferred",
    source,
    visible,
    frontendFallbackPolicy: "forbidden_frontend_fallback",
    reason,
  };
}

export function resolveArticleRuntimeContract(article: CmsArticle): ArticleRuntimeContract {
  const hasEvidenceBackedAnswerSurface = hasVisibleAnswerSurface(article.answerSurface)
    && Boolean(article.answerSurface?.evidenceRefs.length);
  const hasRelatedTest = hasBackendRelatedTest(article);
  const hasVisibleTest = hasVisibleRelatedTest(article);
  const hasRelatedTopic = hasBackendRelatedTopic(article);
  const hasVisibleTopic = hasVisibleRelatedTopic(article);

  return {
    version: ARTICLE_RUNTIME_CONTRACT_VERSION,
    pageFamily: "article_detail",
    features: [
      articleRuntimeFeature(
        "visible_faq",
        hasVisibleArticleFaq(article),
        hasVisibleArticleFaq(article),
        "answer_surface_v1.faq_blocks",
        "FAQPage JSON-LD may only use visible answer_surface_v1 FAQ blocks."
      ),
      articleRuntimeFeature(
        "visible_cta",
        hasVisibleArticleCta(article),
        hasVisibleArticleCta(article),
        "landing_surface_v1.cta_bundle|answer_surface_v1.next_step_blocks",
        "Article CTAs must come from backend/CMS landing or answer surfaces."
      ),
      articleRuntimeFeature(
        "related_test",
        hasRelatedTest,
        hasVisibleTest,
        "article.related_test_slug|landing_surface_v1.start_test_target|answer_surface_v1.next_step_blocks",
        "Related test references must be backend/CMS provided."
      ),
      articleRuntimeFeature(
        "related_topic",
        hasRelatedTopic,
        hasVisibleTopic,
        "landing_surface_v1.related_surface_keys|answer_surface_v1.related_surface_keys",
        "Topic links must be backend/CMS provided and not inferred from article tags."
      ),
      articleRuntimeFeature(
        "related_articles",
        false,
        false,
        "deferred_backend_contract",
        "Article-specific related article lists are not in the article detail API contract yet."
      ),
      articleRuntimeFeature(
        "evidence_citation",
        hasEvidenceBackedAnswerSurface,
        hasEvidenceBackedAnswerSurface,
        "answer_surface_v1.evidence_refs",
        "Evidence readiness requires visible answer-surface content plus backend evidence refs."
      ),
      articleRuntimeFeature(
        "report_preview",
        false,
        false,
        "deferred_backend_contract",
        "Report preview placement must wait for backend/CMS ownership."
      ),
      articleRuntimeFeature(
        "claim_boundary_metadata",
        false,
        false,
        "deferred_backend_contract",
        "Claim boundary metadata is not part of the article detail API contract yet."
      ),
    ],
  };
}

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

function normalizeStringList(value: unknown): string[] {
  if (typeof value === "string") {
    value = [value];
  }
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)));
}

function normalizeArticleTestEdges(value: unknown): CmsArticleTestEdge[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const testSlug = normalizeIsoValue(readRecordValue(record, "test_slug", "testSlug", "slug"));
      if (!testSlug) {
        return null;
      }

      return {
        testSlug,
        role: normalizeIsoValue(readRecordValue(record, "role")) ?? "contextual",
        locale: normalizeIsoValue(readRecordValue(record, "locale")),
        sortOrder: normalizePositiveInteger(readRecordValue(record, "sort_order", "sortOrder")),
        safetyLevel: normalizeIsoValue(readRecordValue(record, "safety_level", "safetyLevel")) ?? "normal",
        visibility: normalizeIsoValue(readRecordValue(record, "visibility")) ?? "public",
      };
    })
    .filter((item): item is CmsArticleTestEdge => item !== null);
}

function normalizeStatus(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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

function normalizeArticlePublishedRevisionId(article: CmsArticleApiRecord): number | null {
  return (
    normalizePositiveInteger(article.published_revision_id) ??
    normalizePositiveInteger(article.publishedRevisionId) ??
    normalizePositiveInteger(readRecordValue(article.published_revision, "id")) ??
    normalizePositiveInteger(readRecordValue(article.publishedRevision, "id"))
  );
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

function normalizeBackendArticleAlternate(value: unknown): string | null {
  const normalized = normalizeIsoValue(value);
  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    return canonicalUrl(parsed.pathname);
  } catch {
    return normalized.startsWith("/") ? canonicalUrl(normalized) : null;
  }
}

export function normalizeArticleSlug(value: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length > MAX_ARTICLE_SLUG_LENGTH || !ARTICLE_SLUG_PATTERN.test(normalized)) {
    return "";
  }

  return normalized;
}

export function normalizeArticleListPage(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? "1"), 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(Math.floor(parsed), MAX_ARTICLE_LIST_PAGE);
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
        en: normalizeBackendArticleAlternate(seo.meta?.alternates?.en),
        "zh-CN": normalizeBackendArticleAlternate(seo.meta?.alternates?.["zh-CN"]),
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
  const testEdges = normalizeArticleTestEdges(article.test_edges);
  const relatedTestSlug = normalizeIsoValue(article.related_test_slug);
  const relatedTestSlugs = Array.from(new Set([
    ...(relatedTestSlug ? [relatedTestSlug] : []),
    ...normalizeStringList(article.related_test_slugs),
    ...testEdges.map((edge) => edge.testSlug),
  ]));

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
    relatedTestSlug,
    relatedTestSlugs,
    testEdges,
    translationGroupId: normalizeIsoValue(article.translation_group_id) ?? normalizeIsoValue(article.translationGroupId),
    voice: normalizeIsoValue(article.voice),
    voiceOrder: normalizePositiveInteger(article.voice_order),
    status: normalizeStatus(article.status),
    isPublic: Boolean(article.is_public),
    isIndexable: Boolean(article.is_indexable),
    ...(article.sitemap_eligible === false ? { sitemapEligible: false } : {}),
    ...(article.llms_eligible === false ? { llmsEligible: false } : {}),
    publishedRevisionId: normalizeArticlePublishedRevisionId(article),
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

function isPublishedRevisionBackedArticle(article: CmsArticle, locale: Locale | string): boolean {
  return (
    matchesRequestedLocale(article.locale, locale)
    && article.status === "published"
    && article.isPublic
    && article.publishedRevisionId !== null
  );
}

export async function getCmsArticles(params: GetCmsArticlesParams): Promise<GetCmsArticlesResult> {
  const allowLocalFallback = params.allowLocalFallback !== false;
  const requestedPage = normalizeArticleListPage(params.page);
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

    const rawItems = Array.isArray(response.items) ? response.items : [];
    const items = rawItems
      .map(normalizeArticle)
      .filter((article) => article.slug && article.title)
      .filter((article) => isPublishedRevisionBackedArticle(article, params.locale));
    const droppedItems = rawItems.length - items.length;
    const responseTotal = typeof response.pagination?.total === "number" ? response.pagination.total : items.length;
    const visibleTotal = droppedItems > 0 ? items.length : responseTotal;
    const visibleLastPage =
      droppedItems > 0
        ? Math.max(1, Math.ceil(visibleTotal / requestedPerPage))
        : (typeof response.pagination?.last_page === "number" ? response.pagination.last_page : 1);

    return {
      items,
      pagination: {
        currentPage: typeof response.pagination?.current_page === "number" ? response.pagination.current_page : requestedPage,
        perPage: typeof response.pagination?.per_page === "number" ? response.pagination.per_page : requestedPerPage,
        total: visibleTotal,
        lastPage: visibleLastPage,
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
  const page = normalizeArticleListPage(params.page);
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
    useStaleOnUnusable: false,
    useStaleOnError: false,
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
  const maxPages =
    typeof params.maxPages === "number" && params.maxPages > 0
      ? Math.floor(params.maxPages)
      : Number.POSITIVE_INFINITY;
  const seen = new Set<string>();
  const entries: CmsArticleLlmsEntry[] = [];

  let currentPage = 1;
  let lastPage = 1;

  while (currentPage <= lastPage && currentPage <= maxPages) {
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
        ...(article.llmsEligible === false ? { llmsEligible: false } : {}),
        updatedAt: article.updatedAt ?? article.publishedAt ?? article.createdAt,
      });
    }

    currentPage += 1;
  }

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
  const maxPages =
    typeof params.maxPages === "number" && params.maxPages > 0
      ? Math.floor(params.maxPages)
      : Number.POSITIVE_INFINITY;

  return withLastKnownGood({
    key: `articles:llms:${locale}:${perPage}:${maxPages}`,
    load: () => listCmsArticlesForLlms({ locale, perPage, maxPages }),
    isUsable: (entries) => entries.length > 0,
    useStaleOnUnusable: false,
    useStaleOnError: false,
  });
}

export async function getCmsArticle(slug: string, locale: Locale | string): Promise<CmsArticle | null> {
  const normalizedSlug = normalizeArticleSlug(slug);
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
      ...UNBOUNDED_ARTICLE_DETAIL_FETCH_OPTIONS,
    });

    if (!response.article) {
      return null;
    }

    const article = normalizeArticle(response.article);
    if (!isPublishedRevisionBackedArticle(article, locale)) {
      return null;
    }

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
    useStaleOnUnusable: false,
    useStaleOnError: false,
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
        ...UNBOUNDED_ARTICLE_DETAIL_FETCH_OPTIONS,
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
    useStaleOnUnusable: false,
    useStaleOnError: false,
  });
}
